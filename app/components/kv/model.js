import {Observable as O} from 'rx';
import I from 'immutable';

import {memoize, arrayOfSize, fillBits} from '../../lib/utils';
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
    loop: {
      include: fillBits(length),
      exclude: fillBits(length),
    },
  };
};

// Set the active loop of the given kv
// If start and end are not given the loop will be cleared
const loop = (size, start, end) => {
  const all = fillBits(size + 1);
  if (typeof start === 'undefined') {
    return I.Map({
      include: all,
      exclude: all,
    });
  } else {
    return I.Map({
      include: start & end,
      exclude: all & ~(start | end),
    });
  }
};

// add one input variable to the given kv
const addInput = (kv) => {
  const oldSize = kv.get('variables').size;
  if (oldSize > 8) {
    return kv;
  }
  return kv
    .update('variables',
      (old) => old.push(generateVariableName(old.size)))
    .update('data',
      (old) => old.concat(old))
    .set('loop', loop(oldSize + 1));
};

// remove one input variable from the given kv
const removeInput = (kv) => {
  const oldSize = kv.get('variables').size;
  if (oldSize < 1) {
    return kv;
  }
  return kv
  .update('variables',
    (old) => old.pop())
  .update('data',
    (old) => old.setSize(old.size / 2))
  .set('loop', loop(oldSize - 1));
};

// cycle the given bit [... -> true -> false -> null -> ...]
const cycleBit = (kv, bit, reverse) => {
  const oldValue = kv.get('data').get(bit);
  const newValueA = (oldValue === false) ? null : !oldValue;
  const newValueB = (oldValue === true) ? null : oldValue === false;
  const newValue = reverse ? newValueA : newValueB;

  return kv.setIn(['data', bit], newValue);
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
      return state.set('loop',
        loop(state.get('variables').size,
          startOffset, targetOffset)
      );
    }),
    actions.moveEnd$.map(() => (state) => {
      const newLoop = state.get('loop');

      return state.update('loops', (loops) => {
        if (newLoop.include & newLoop.exclude) {
          return loops;
        } else {
          return loops.push(newLoop.set('color', generateColor(loops.size)));
        }
      }).set('loop',
        loop(state.get('variables').size)
      );
    })
  );
};

const fromJson = I.fromJS.bind(I);

export default (initial$, actions) =>
  O.merge(
    initial$.startWith(init())
    .map(fromJson)
    .do(console.log.bind(console))
    .map((kv) => () => kv),
    modifiers(actions)
  ).scan(applyModification, null)
  .map((kv) => ({
    kv,
    layout: memLayout(kv.get('variables').size),
  }))
;
