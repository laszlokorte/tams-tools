import {Observable as O} from 'rx';
import I from 'immutable';

import {memoize, arrayOfSize, fillBits} from '../../lib/utils';
import {buildLayout} from './kvlayout';

const MODE_DNF = 'dnf';
const MODE_KNF = 'knf';

// Generate a variable name from a given index
const generateVariableName = (index) => {
  return String.fromCharCode(65 + index);
};

const colorPalette = [
  '#E91E63',
  '#9C27B0',
  '#3F51B5',
  '#2196F3',
  '#00BCD4',
  '#009688',
  '#4CAF50',
  '#8BC34A',
  '#CDDC39',
  '#FFC107',
  '#FF9800',
  '#FF5722',
  '#795548',
];

const generateColor = (index) =>
  colorPalette[index % colorPalette.length]
;

const nullArray = (size) =>
  arrayOfSize(Math.pow(2, size))
    .map(() => null)
;

// create a new kv diagram with given size
// size: number of inputs
const newKV = (size) => {
  const array = nullArray(size)
    .map((_,i) => {
      return i % 2 === 0;
    });

  const labels = arrayOfSize(size)
    .map((_,i) => {
      return generateVariableName(i);
    });

  return {
    mode: MODE_DNF,
    variables: labels,
    outputs: [
      {
        name: "O1",
        values: array,
      },
    ],
    loops: [
    ],
  };
};

const makeLoop = (size, output = 0, start, end) => {
  const all = fillBits(size);
  if (typeof start === 'undefined') {
    return I.Map({
      include: -1,
      exclude: -1,
      output,
    });
  } else {
    return I.Map({
      include: start & end,
      exclude: all & ~(start | end),
      output,
    });
  }
};

export const matchesLoop = (offset, include, exclude) =>
  (include & offset) === include &&
  (exclude & offset) === 0
;

const isLoopNotEmpty = (loop, variableCount) => {
  const all = fillBits(variableCount);
  const include = loop.get('include');
  const exclude = loop.get('exclude');

  return (include & exclude) === 0 && include <= all;
};

const resizeLoop = (loop, size) => {
  const mask = fillBits(size);

  return loop
    .update('include', (val) => val & mask)
    .update('exclude', (val) => val & mask);
};

// add one input variable to the given kv
const addInput = (kv) => {
  const oldSize = kv.get('variables').size;
  if (oldSize > 7) {
    return kv;
  }
  return kv
    .update('variables',
      (old) => old.push(generateVariableName(old.size)))
    .update('outputs',
      (outputs) => outputs.map(
      (output) => output.update('values',
        (old) => old.concat(old))))
    .set('currentLoop', makeLoop(oldSize + 1));
};

// remove one input variable from the given kv
const removeInput = (kv) => {
  const oldSize = kv.get('variables').size;
  const newSize = oldSize - 1;
  if (oldSize < 1) {
    return kv;
  }
  return kv
    .update('variables',
      (old) => old.pop())
    .update('outputs',
      (outputs) => outputs.map(
        (output) => output.update('values',
        (old) => old.setSize(old.size / 2))))
    .set('currentLoop', makeLoop(newSize))
    .update('loops', (loops) =>
      loops
      .filter((loop) => isLoopNotEmpty(loop, newSize))
      .map((loop) => resizeLoop(loop, newSize))
    );
};

const buildOutput = (index, size) =>
  I.Map({
    name: 'O',
    values: I.List(nullArray(size)),
  })
;

const addOutput = (state) => {
  return state.update('outputs', (outputs) =>
    outputs.push(buildOutput(outputs.size, state.get('variables').size)))
  .set('currentOutput', state.get('outputs').size);
};

const removeOutput = (state, index) => {
  return state.update('outputs', (outputs) => {
    const newOutputs = outputs.remove(index);

    if (newOutputs.size === 0) {
      return newOutputs.push(buildOutput(0, state.get('variables').size));
    } else {
      return newOutputs;
    }
  }).update('currentOutput', (val) => {
    return val < index ? val : Math.max(0, val - 1);
  }).update('loops', (loops) =>
    loops
      .filter((loop) => loop.get('output') !== index)
      .map((loop) => loop.update('output',
        (val) => val < index ? val : Math.max(0, val - 1)))
  );
};

const selectOutput = (state, index) => {
  return state.set('currentOutput', index);
};

const switchMode = (state, mode) => {
  if ((mode !== MODE_DNF && mode !== MODE_KNF) ||
      mode === state.get('mode')) {
    return state;
  }

  return state
    .set('mode', mode)
    .set('loops', I.List());
};

const removeLoop = (kv, loopIndex) => {
  return kv.update('loops',(loop) =>
    loop.delete(loopIndex)
  );
};

const removeFieldFromLoop = (loop, output, bit) => {
  const include = loop.get('include');
  const exclude = loop.get('exclude');

  // loop does not belong to that output anyway
  if (loop.get('output') !== output) {
    return loop;
  }

  // loop does not contain the field anyway
  if (!matchesLoop(bit, include, exclude)) {
    return loop;
  }

  // the bits by which are not constrained by the loop
  const unused = ~include & ~exclude;
  // bits which could be be added to the loop's positive constraints
  const includableBit = ~bit & unused;
  // bits which could be be added to the loop's negative constraints
  const excludableBit = bit & unused;

  // extract only the lowest bit
  const lowestIncludableBit = includableBit & -includableBit;
  const lowestExcludableBit = excludableBit & -excludableBit;

  // check which of the bit's is less significant but not zero
  const changeExclude = lowestExcludableBit &&
    lowestExcludableBit < lowestIncludableBit;

  return loop.update('exclude', (val) =>
    changeExclude ? lowestExcludableBit | val : val
  ).update('include', (val) =>
    !changeExclude ? lowestIncludableBit | val : val
  );
};

export const isValidLoopValue = (mode, value) => {
  const notAllowedValue = (mode === MODE_KNF);

  return value !== notAllowedValue;
};

// cycle the given bit [... -> true -> false -> null -> ...]
const cycleValue = (kv, output, offset, reverse) => {
  const oldValue = kv.get('outputs')
    .get(output)
    .get('values').get(offset);
  const newValueA = (oldValue === false) ? null : !oldValue;
  const newValueB = (oldValue === true) ? null : oldValue === false;
  const newValue = reverse ? newValueA : newValueB;

  const newKv = kv.setIn(
    ['outputs', output, 'values', offset], newValue);

  if (!isValidLoopValue(kv.get('mode'), newValue)) {
    return newKv.update('loops', (loops) =>
      loops
        .map((loop) => removeFieldFromLoop(loop, output, offset))
        .filter((loop) => isLoopNotEmpty(loop, kv.get('variables').size))
    );
  } else {
    return newKv;
  }
};

const isLoopValid = (state, loop) => {
  const output = loop.get('output');
  const include = loop.get('include');
  const exclude = loop.get('exclude');
  const mode = state.get('mode');

  return state.get('outputs')
    .get(output)
    .get('values')
    .reduce((prev, val, index) =>
      prev &&
      (!matchesLoop(index, include, exclude) ||
      isValidLoopValue(mode, val))
    , true);
};

const init = () =>
  newKV(4)
;

const memLayout = memoize(buildLayout);

const applyModification = (prev, modfn) => modfn(prev);

const modifiers = (actions) => {
  return O.merge(
    actions.addInput$.map(() => (state) => {
      return addInput(state);
    }),
    actions.removeInput$.map(() => (state) => {
      return removeInput(state);
    }),
    actions.cycleValue$.map(({output, offset, reverse}) => (state) => {
      return cycleValue(state, output, offset, reverse);
    }),
    actions.tryLoop$.map(({output, startOffset, targetOffset}) => (state) => {
      return state.set('currentLoop',
        makeLoop(state.get('variables').size, output,
          startOffset, targetOffset)
      );
    }),
    actions.removeLoop$.map((loopIndex) => (state) => {
      return removeLoop(state, loopIndex);
    }),
    actions.addLoop$.map(({output, startOffset, targetOffset}) => (state) => {
      const newLoop = makeLoop(state.get('variables').size, output,
          startOffset, targetOffset);

      return state.update('loops', (loops) => {
        if (isLoopNotEmpty(newLoop, state.get('variables').size) &&
            isLoopValid(state, newLoop)) {
          return loops.push(
            newLoop
              .set('color', generateColor(loops.size))
          );
        } else {
          return loops;
        }
      }).set('currentLoop',
        makeLoop(state.get('variables').size)
      );
    }),
    actions.addOutput$.map(() => (state) => {
      return addOutput(state);
    }),
    actions.removeOutput$.map((index) => (state) => {
      return removeOutput(state, index);
    }),
    actions.selectOutput$.map((index) => (state) => {
      return selectOutput(state, index);
    }),
    actions.switchMode$.map((mode) => (state) => {
      return switchMode(state, mode);
    })
  );
};

const fromJson = (json) => I.Map({
  mode: json.mode,
  variables: I.List(json.variables),
  outputs: I.List(json.outputs.map((output) =>
    I.Map({
      name: output.name,
      values: I.List(output.values),
    })
  )),
  loops: I.List(json.loops.map((loop) =>
    I.Map({
      color: loop.color,
      include: loop.include,
      exclude: loop.exclude,
    })
  )),
  currentLoop: makeLoop(json.variables.length),
  currentOutput: 0,
});

export default (initial$, actions) =>
  O.combineLatest(
    O.merge(
      initial$.startWith(init())
      .map(fromJson)
      .map((kv) => () => kv),
      modifiers(actions)
    ).scan(applyModification, null),
    actions.help$.startWith(false), (kv, help) => ({
      kv,
      help: help,
      layout: memLayout(kv.get('variables').size),
    })
  )
;
