import {
  div,
} from '@cycle/dom';

import {
  insideCubeMasked,
} from '../../lib/diagram';

import './index.styl';

const renderSingleLoop = ({color, top, right, bottom, left, xEdge, yEdge}) => {
  return div('.kv-loop-single', {
    style: {
      top: `${top}%`,
      right: `${right}%`,
      bottom: `${bottom}%`,
      left: `${left}%`,
      borderColor: color,
    },
    className: [
      xEdge ? `kv-loop-edge-${xEdge}` : null,
      yEdge ? `kv-loop-edge-${yEdge}` : null,
    ].join(' '),
  });
};

// render a percentually positioned loop of a given color
// rowCount: the number of rows of the kv leaf grid
// colCount: the number of columns
// xa: 0-based index of the column the loop starts
// ya: 0-based index of the row the loop starts
// xb, yb: indices of the rows/columns where the loop ends
const renderLoop = ({color, rowCount, colCount, x, y}) => {
  const width = x.to - x.from + 1;
  const height = y.to - y.from + 1;

  const left = Math.floor(100 * x.from / colCount);
  const top = Math.floor(100 * y.from / rowCount);
  const right = Math.ceil(100 * (colCount - width) / colCount) - left;
  const bottom = Math.ceil(100 * (rowCount - height) / rowCount) - top;

  if (left < 0 || top < 0 || right < 0 || bottom < 0) {
    return null;
  }

  if (x.wrap) {
    return [
      renderLoop({color, rowCount, colCount, x: {
        from: 0,
        to: x.from,
        edge: 'left',
      }, y}),
      renderLoop({color, rowCount, colCount, x: {
        from: colCount - x.to,
        to: colCount - 1,
        edge: 'right',
      }, y}),
    ];
  } else if (y.wrap) {
    return [
      renderLoop({color, rowCount, colCount, y: {
        from: 0,
        to: y.from,
        edge: 'top',
      }, x}),
      renderLoop({color, rowCount, colCount, y: {
        from: rowCount - y.to,
        to: rowCount - 1,
        edge: 'bottom',
      }, x}),
    ];
  } else {
    return renderSingleLoop({
      color,
      top, right, bottom, left,
      xEdge: x.edge,
      yEdge: y.edge,
    });
  }
};

const calcCubeRange = (dontcare, cols, cube) => {
  const fields = cols.map((col) =>
    insideCubeMasked(col, cube, dontcare.not())
  );

  const start = fields.findIndex((v) => v);
  const width = fields.filter((v) => v).count();

  return {
    from: start,
    to: start + width - 1,
    wrap: !fields.get(start + width - 1),
  };
};

// Render the collection of loops for a kv leaf grid
// rows, cols: number of rows and columns
export default (loops, kvMode, rows, cols) => {
  const rowCount = rows.size;
  const colCount = cols.size;

  const padding =
    (colCount > 1 ? '.kv-loop-padding-top' : '') +
    (rowCount > 2 ? '.kv-loop-padding-right' : '') +
    (colCount > 3 ? '.kv-loop-padding-bottom' : '') +
    (rowCount > 1 ? '.kv-loop-padding-left' : '');

  const colMask = cols.reduce((a,b) => a.or(b));
  const rowMask = rows.reduce((a,b) => a.or(b));
  const scopeMask = colMask.xor(rowMask);

  return div('.kv-loops-container' + padding,
    loops
    .filter((loop) => loop.mode === kvMode)
    .map((loop) => div('.kv-loop', [
      renderLoop({
        color: loop.color,
        rowCount, colCount,
        x: calcCubeRange(scopeMask.and(rowMask), cols, loop.cube),
        y: calcCubeRange(scopeMask.and(colMask), rows, loop.cube),
      }),
    ])).toArray()
  );
};
