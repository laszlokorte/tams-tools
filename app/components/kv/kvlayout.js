import {zip} from '../../lib/utils';

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
// defined later
let kvSubLayout;

// generates a KV layout for the given size
// scope is just needed for recursive calls
export const kvBuildLayout = (size, scope) => {
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
