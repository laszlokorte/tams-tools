import {Observable as O} from 'rx';
import I from 'immutable';

import {memoize, arrayOfSize, fillBits, log} from '../../lib/utils';
import {buildLayout} from './kvlayout';

// Generate a variable name from a given index
const generateVariableName = (index) => {
  return String.fromCharCode(65 + index);
};

const colorPalette = [
  '#E91E63',
  '#FF9800',
  '#FF5252',
  '#9C27B0',
  '#3E81bF',
];

const generateColor = (index) =>
  colorPalette[index % colorPalette.length]
;

// create a new kv diagram with given size
// size: number of inputs
const newKV = (size, base) => {
  const length = Math.pow(2, size);
  const array = arrayOfSize(length)
    .map((_,i) => {
      if (base && base.data.size > i) {
        return base.data[i];
      }
      return i % 2 === 0;
    });

  const labels = arrayOfSize(size)
    .map((_,i) => {
      return generateVariableName(i);
    });

  return {
    variables: labels,
    data: array,
    loops: [
    ],
  };
};

const makeLoop = (size, start, end) => {
  const all = fillBits(size);
  if (typeof start === 'undefined') {
    return I.Map({
      include: -1,
      exclude: -1,
    });
  } else {
    return I.Map({
      include: start & end,
      exclude: all & ~(start | end),
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
    .update('data',
      (old) => old.concat(old))
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
    .update('data',
      (old) => old.setSize(old.size / 2))
    .set('currentLoop', makeLoop(newSize))
    .update('loops', (loops) =>
      loops
      .filter((loop) => isLoopNotEmpty(loop, newSize))
      .map((loop) => resizeLoop(loop, newSize))
    );
};

const removeLoop = (kv, loopIndex) => {
  return kv.update('loops',(loop) =>
    loop.delete(loopIndex)
  );
};

const removeFieldFromLoop = (loop, bit) => {
  const include = loop.get('include');
  const exclude = loop.get('exclude');

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

// cycle the given bit [... -> true -> false -> null -> ...]
const cycleBit = (kv, bit, reverse) => {
  const oldValue = kv.get('data').get(bit);
  const newValueA = (oldValue === false) ? null : !oldValue;
  const newValueB = (oldValue === true) ? null : oldValue === false;
  const newValue = reverse ? newValueA : newValueB;

  return kv
    .setIn(['data', bit], newValue)
    .update('loops', (loops) => {
      if (newValue === false) {
        return loops
          .map((loop) => removeFieldFromLoop(loop, bit))
          .filter((loop) => isLoopNotEmpty(loop, kv.get('variables').size));
      } else {
        return loops;
      }
    });
};

const isCurrentLoopAllowed = (state) => {
  const loop = state.get('currentLoop');
  const include = loop.get('include');
  const exclude = loop.get('exclude');

  return state.get('data').reduce((prev, val, index) =>
    prev && (!matchesLoop(index, include, exclude) || val !== false)
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
    actions.cycleValue$.map(({offset, reverse}) => (state) => {
      return cycleBit(state, offset, reverse);
    }),
    actions.move$.map(({startOffset, targetOffset}) => (state) => {
      return state.set('currentLoop',
        makeLoop(state.get('variables').size,
          startOffset, targetOffset)
      );
    }),
    actions.removeLoop$.map((loopIndex) => (state) => {
      return removeLoop(state, loopIndex);
    }),
    actions.moveEnd$.map(() => (state) => {
      const newLoop = state.get('currentLoop');

      return state.update('loops', (loops) => {
        if (isLoopNotEmpty(newLoop, state.get('variables').size) &&
            isCurrentLoopAllowed(state)) {
          return loops.push(newLoop.set('color', generateColor(loops.size)));
        } else {
          return loops;
        }
      }).set('currentLoop',
        makeLoop(state.get('variables').size)
      );
    })
  );
};

const fromJson = (json) => I.Map({
  variables: I.List(json.variables),
  data: I.List(json.data),
  loops: I.List(json.loops.map((loop) =>
    I.Map({
      color: loop.color,
      include: loop.include,
      exclude: loop.exclude,
    })
  )),
  currentLoop: makeLoop(json.variables.length),
});

export default (initial$, actions) =>
  O.merge(
    initial$.startWith(init())
    .map(fromJson)
    .do(log)
    .map((kv) => () => kv),
    modifiers(actions)
  ).scan(applyModification, null)
  .map((kv) => ({
    kv,
    layout: memLayout(kv.get('variables').size),
  }))
;
