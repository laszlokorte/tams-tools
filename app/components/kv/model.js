import {Observable as O} from 'rx';

import {zip, memoize, clone, arrayOfSize, fillBits} from '../../lib/utils';

// Generate a variable name from a given index
export const generateVariableName = (index) => {
  return String.fromCharCode(65 + index);
};

export const colorPalette = [
  '#E91E63',
  '#FF9800',
  '#FF5252',
  '#9C27B0',
];

// create a new kv diagram with given size
// size: number of inputs
export const kvCreate = (size, base) => {
  const length = Math.pow(2, size);
  const array = arrayOfSize(length)
    .map((_,i) => {
      if (base && base.data.length > i) {
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
    loops: colorPalette.map((color) => ({
      color,
      include: 0,
      exclude: 0,
    })),
    loop: {
      include: fillBits(length),
      exclude: fillBits(length),
    },
  };
};

// Set the active loop of the given kv
// If start and end are not given the loop will be cleared
export const kvLoopSet = (kv, start, end) => {
  const all = fillBits(kv.variables.length + 1);
  if (typeof start === 'undefined') {
    kv.loop.include = all;
    kv.loop.exclude = all;
  } else {
    kv.loop.include = start & end;
    kv.loop.exclude = all & ~(start | end);
  }
};

// add one input variable to the given kv
export const kvAddInput = (kv) => {
  if (kv.variables.length > 8) {
    return;
  }
  kv.variables.push(generateVariableName(kv.variables.length));
  kv.data = kv.data.concat(kv.data);
  kvLoopSet(kv);
};

// remove one input variable from the given kv
export const kvRemoveInput = (kv) => {
  if (kv.variables.length < 1) {
    return;
  }
  kv.variables.pop();
  kv.data.length /= 2;
  kvLoopSet(kv);
};

// cycle the given bit [... -> true -> false -> null -> ...]
export const kvCycleBit = (kv, bit, reverse) => {
  const oldValue = kv.data[bit];
  const newValueA = (oldValue === false) ? null : !oldValue;
  const newValueB = (oldValue === true) ? null : oldValue === false;
  const newValue = reverse ? newValueA : newValueB;
  kv.data[bit] = newValue;
};

// The layouts for different kv sizes
const kvLayouts = [
  // Layout for 0 inputs (1 value)
  (s) => {
    return [
      [s(0)],
    ];
  },

  // Layout for 1 input (2 values)
  (s) => {
    return [
      [s(0)],
      [s(1)],
    ];
  },

  // Layout for 2 inputs (4 values)
  (s) => {
    return [
      [s(0), s(2)],
      [s(1), s(3)],
    ];
  },

  // Layout for 3 inputs (8 values)
  (s) => {
    return [
      [s(0), s(2), s(6), s(4)],
      [s(1), s(3), s(7), s(5)],
    ];
  },

  // Layout for 4 inputs (16 values)
  (s) => {
    return [
      [s(0), s(2), s(6), s(4)],
      [s(8), s(10), s(14), s(12)],
      [s(9), s(11), s(15), s(13)],
      [s(1), s(3), s(7), s(5)],
    ];
  },

  // Layouts for more than 4 inputs will automatically
  // composed by nesting the base layouts recursively
  // for example a layout for a kv with 6 inputs (64 values)
  // will be composed by nesting the twotimes the layout for 4 values
  // into the layout for for two values.

  // The nth element (0-based) in this array has to be a function with
  // calls the callback it's given once with each value from
  // (including) 0 to (excluding) 2^n
];

// generates a nested layout
let kvSubLayout;

// generates a KV layout for the given size
// scope is just needed for recursive calls
const kvBuildLayout = (size, scope) => {
  const _scope = scope || 0;
  const maxLayoutSize = kvLayouts.length - 1;
  const layoutType = size && (size - 1) % maxLayoutSize + 1;
  const layouter = kvLayouts[layoutType];
  const sizeDelta = layoutType;
  const newSize = size - sizeDelta;
  const stepSize = Math.pow(2, newSize);
  const treeHeight = Math.ceil(
    Math.log(newSize + 1) / Math.log(kvLayouts.length)
  );

  const rows = layouter(
    kvSubLayout.bind(null, {size: newSize, scope: _scope, stepSize})
  );

  return {
    treeHeight: treeHeight,
    count: sizeDelta,
    columns: rows
      .map((row) =>
        row.map((col) => col.scope)
      )
      .reduce((prev, cols) =>
        zip(prev, cols, (u,v) => u & v)
      ),
    rows: rows.map((cols) =>
      cols.reduce((p,v) => p & v.scope, -1)
    ),
    grid: rows,
  };
};

kvSubLayout = ({size, scope, stepSize}, i) => {
  if (size === 0) {
    return {
      scope: scope + i,
    };
  } else {
    return {
      scope: scope + i,
      children: kvBuildLayout(size, scope + i * stepSize),
    };
  }
};

const init = () =>
  kvCreate(4)
;

const memLayout = memoize(kvBuildLayout);

const applyModification = (prev, modfn) => modfn(prev);

const modifiers = (actions) => {
  return O.merge(
    actions.addInput$.map(() => (state) => {
      const newState = clone(state);
      kvAddInput(newState);
      return newState;
    }),
    actions.removeInput$.map(() => (state) => {
      const newState = clone(state);
      kvRemoveInput(newState);
      return newState;
    }),
    actions.cycleValue$.map(({offset, reverse}) => (state) => {
      const newState = clone(state);
      kvCycleBit(newState, offset, reverse);
      return newState;
    }),
    actions.move$.map(({startOffset, targetOffset}) => (state) => {
      const newState = clone(state);
      kvLoopSet(newState, startOffset, targetOffset);
      return newState;
    }),
    actions.moveEnd$.map(() => (state) => {
      const newState = clone(state);
      kvLoopSet(newState);
      return newState;
    })
  );
};

export default (initial$, actions) =>
  O.merge(
    initial$.startWith(init())
    .map((kv) => () => kv),
    modifiers(actions)
  ).scan(applyModification, null)
  .map((kv) => ({
    kv,
    layout: memLayout(kv.variables.length),
  }))
;
