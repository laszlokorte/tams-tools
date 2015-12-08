import {Observable as O} from 'rx';

import {zip, memoize, clone} from '../../lib/utils';

// Generate a variable name from a given index
export const generateVariableName = (index) => {
  return String.fromCharCode(65 + index);
};

// create a new kv diagram with given size
// size: number of inputs
export const kvCreate = (size, base) => {
  const length = Math.pow(2, size);
  const array = Array(...{length: length})
    .map((_,i) => {
      if (base && base.data.length > i) {
        return base.data[i];
      }
      return i % 2 === 0;
    });

  const labels = Array(...{length: size})
    .map((_,i) => {
      return generateVariableName(i);
    });

  return {
    variables: labels,
    data: array,
    loops: [
      {
        color: '#E91E63',
        include: 0,
        exclude: 0,
      },
      {
        color: '#FF9800',
        include: 0,
        exclude: 0,
      },
      {
        color: '#FF5252',
        include: 0,
        exclude: 0,
      },
      {
        color: '#9C27B0',
        include: 0,
        exclude: 0,
      },
    ],
    loop: {
      include: Math.pow(2, length) - 1,
      exclude: Math.pow(2, length) - 1,
    },
  };
};

// Set the active loop of the given kv
// If start and end are not given the loop will be cleared
export const kvLoopSet = (kv, start, end) => {
  const all = Math.pow(2, kv.variables.length + 1) - 1;
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
      [s(1)],
    ];
  },

  // Layout for 1 input (2 values)
  (s) => {
    return [
      [s(1)],
      [s(2)],
    ];
  },

  // Layout for 2 inputs (4 values)
  (s) => {
    return [
      [s(1), s(3)],
      [s(2), s(4)],
    ];
  },

  // Layout for 3 inputs (8 values)
  (s) => {
    return [
      [s(1), s(3), s(7), s(5)],
      [s(2), s(4), s(8), s(6)],
    ];
  },

  // Layout for 4 inputs (16 values)
  (s) => {
    return [
      [s(1), s(3), s(7), s(5)],
      [s(9), s(11), s(15), s(13)],
      [s(10), s(12), s(16), s(14)],
      [s(2), s(4), s(8), s(6)],
    ];
  },

  // Layouts for more than 4 inputs will automatically
  // composed by nesting the base layouts recursively
  // for example a layout for a kv with 6 inputs (64 values)
  // will be composed by nesting the twotimes the layout for 4 values
  // into the layout for for two values.

  // The nth element (0-based) in this array has to be a function with
  // calls the callback it's given once with each value from
  // (including) 1 to (including) 2^n
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

  const layout = layouter(
    kvSubLayout.bind(null, {size: newSize, scope: _scope, stepSize})
  );

  return {
    treeHeight: treeHeight,
    count: sizeDelta,
    columns: layout.reduce((prev, cols) =>
      zip(prev, cols, (u,v) =>
        ({scope: u.scope & v.scope})
      )
    ).map((obj) => obj.scope),
    rows: layout.map((cols) =>
      cols.reduce((p,v) => p & v.scope
      , -1)
    ),
    grid: layout,
  };
};

kvSubLayout = ({size, scope, stepSize}, i) => {
  if (size === 0) {
    return {
      scope: scope + i - 1,
    };
  } else {
    return {
      scope: scope + i - 1,
      children: kvBuildLayout(size, scope + (i - 1) * stepSize),
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
