import BitSet from 'bitset.js';
import I from 'immutable';

const layout = I.Record({
  treeHeight: 0,
  count: 0,
  columns: 0,
  rows: 0,
  grid: I.List(),
}, 'layout');

const layoutCell = I.Record({
  scope: BitSet(),
  children: null,
}, 'cell');

const layoutRow = I.Record({
  cells: I.List(),
}, 'row');

/// The layouts for different Karnaugh map sizes
const layouts = [
  /// Layout for 0 inputs (1 value)
  (s) => {
    return [
      [s('0')],
    ];
  },

  /// Layout for 1 input (2 values)
  (s) => {
    return [
      [s('0')],
      [s('1')],
    ];
  },

  /// Layout for 2 inputs (4 values)
  (s) => {
    return [
      [s('00'), s('10')],
      [s('01'), s('11')],
    ];
  },

  /// Layout for 3 inputs (8 values)
  (s) => {
    return [
      [s('000'), s('010'), s('110'), s('100')],
      [s('001'), s('011'), s('111'), s('101')],
    ];
  },

  /// Layout for 4 inputs (16 values)
  (s) => {
    return [
      [s('0000'), s('0010'), s('0110'), s('0100')],
      [s('1000'), s('1010'), s('1110'), s('1100')],
      [s('1001'), s('1011'), s('1111'), s('1101')],
      [s('0001'), s('0011'), s('0111'), s('0101')],
    ];
  },

  /// Layouts for more than 4 inputs will automatically
  /// composed by nesting the base layouts recursively
  /// for example a layout for a kv with 6 inputs (64 values)
  /// will be composed by nesting the twotimes the layout for 4 values
  /// into the layout for for two values.

  /// The nth element (0-based) in this array has to be a function with
  /// calls the callback it's given once with each value from
  /// (including) 0 to (excluding) 2^n
];

/// generates a nested layout
/// defined later
let subLayout;

/// generates a KV layout for the given size
/// scope is just needed for recursive calls
export const buildLayout = (size, scope = 0) => {
  const maxLayoutSize = layouts.length - 1;
  const layoutType = size && (size - 1) % maxLayoutSize + 1;
  const layouter = layouts[layoutType];
  const sizeDelta = layoutType;
  const newSize = size - sizeDelta;
  const stepSize = Math.pow(2, newSize);
  const treeHeight = Math.ceil(
    Math.log(newSize + 1) / Math.log(layouts.length)
  );

  const rows = I.List(layouter(
    subLayout.bind(null, {size: newSize, scope, stepSize})
  )).map((cells) => layoutRow({cells: I.List(cells)}));

  return layout({
    treeHeight: treeHeight,
    count: sizeDelta,
    columns: rows
      .map((row) =>
        row.cells.map((cell) => cell.scope)
      )
      .reduce((prev, cols) =>
        prev.zipWith((u,v) => u.and(v), cols)
      ).toList(),
    rows: rows.map((row) =>
      row.cells.reduce(
        (p,v) => p.and(v.scope),
        BitSet().setRange(0, row.cells.size - 1, 1)
      )
    ).toList(),
    grid: rows,
  });
};

subLayout = ({size, scope, stepSize}, iString) => {
  const iInt = parseInt(iString, 2);
  if (size === 0) {
    return layoutCell({
      scope: BitSet(scope + iInt),
    });
  } else {
    return layoutCell({
      scope: BitSet(scope + iInt),
      children: buildLayout(size, scope + iInt * stepSize),
    });
  }
};
