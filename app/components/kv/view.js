import {Observable as O} from 'rx';

import {
  div, button ,span, ul, li,
  table, tr, th, td,
} from '@cycle/dom';

import {
  insideLoop, isValidValueForMode,
  loopBelongsToOutput,
} from './model/diagram';

import './view.styl';

// convert a cell's value into a string
const renderValue = (val) => {
  if (val === null) {
    return '*';
  } else if (val === false) {
    return '0';
  } else if (val === true) {
    return '1';
  } else {
    return val;
  }
};

const renderSingleLoop = ({color, top, right, bottom, left, xEdge, yEdge}) => {
  return div('.kv-loop', {
    style: {
      top: `${top}%`,
      right: `${right}%`,
      bottom: `${bottom}%`,
      left: `${left}%`,
      'border-color': color,
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

const calcLoopRange = (dontcare, cols, loop) => {
  const include = loop.include;
  const exclude = loop.exclude;

  const fields = cols.map((col) =>
    insideLoop(col & ~dontcare,
      include.and(~dontcare),
      exclude.and(~dontcare))
  );

  const start = fields.findIndex((v) => v);
  const width = fields.filter((v) => v).length;

  return {
    from: start,
    to: start + width - 1,
    wrap: !fields[start + width - 1],
  };
};

// Render the collection of loops for a kv leaf grid
// rows, cols: number of rows and columns
const renderLoops = (loops, rows, cols) => {
  const rowCount = rows.length;
  const colCount = cols.length;

  const padding =
    (colCount > 1 ? '.kv-loop-padding-top' : '') +
    (rowCount > 2 ? '.kv-loop-padding-right' : '') +
    (colCount > 3 ? '.kv-loop-padding-bottom' : '') +
    (rowCount > 1 ? '.kv-loop-padding-left' : '');

  const colMask = cols.reduce((a,b) => a.or(b));
  const rowMask = rows.reduce((a,b) => a.or(b));
  const scopeMask = colMask.xor(rowMask);

  return div('.kv-loops-container' + padding,
    loops.map((loop) =>
      renderLoop({
        color: loop.color,
        rowCount, colCount,
        x: calcLoopRange(scopeMask.and(rowMask), cols, loop),
        y: calcLoopRange(scopeMask.and(colMask), rows, loop),
      })
    ).toArray()
  );
};

const _labelFor = ({inputs, offset}, rowsOrColumns, {include, exclude}) => {
  if (rowsOrColumns.length > include &&
    rowsOrColumns.length > exclude
    ) {
    const intersect = rowsOrColumns[exclude].not().and(rowsOrColumns[include]);
    return inputs.get(offset + 1 + intersect.msb()).name;
  } else {
    return null;
  }
};

const renderTableHead = (colCount, {top, left, right, bottom}) =>
  top !== null &&
  tr('.kv-table-row-title.kv-row-top',[
    left !== null &&
    th('.kv-table-corner') || null,

    top !== null &&
    th('.kv-table-cell-title.kv-cell-neg', `~${top}`) || null,

    top !== null &&
    th('.kv-table-cell-title.kv-cell-pos',
      {colSpan: colCount / 2}, top) || null,

    bottom !== null &&
    th('.kv-table-cell-title.kv-cell-neg',
      `~${top}`) || null,

    right !== null && th('.kv-table-corner') || null,
  ]) || null
;

const renderTableFoot = (colCount, {left, right, bottom}) =>
  bottom !== null && tr('.kv-table-row-title.kv-row-bottom', [
    left !== null &&
    th('.kv-table-corner') || null,

    bottom !== null &&
    th('.kv-table-cell-title.kv-cell-neg',
      {colSpan: colCount / 2}, `~${bottom}`) || null,

    bottom !== null &&
    th('.kv-table-cell-title.kv-cell-pos',
      {colSpan: colCount / 2}, bottom) || null,

    right !== null &&
    th('.kv-table-corner') || null,
  ]) || null
;

const renderTableRowStart = (rowIndex, rowCount, {left}) =>
  left !== null && [
    rowIndex === 0 &&
    th('.kv-table-cell-title.kv-cell-neg.kv-col-left', {
      rowSpan: (rowCount / 2),
    }, `~${left}`) || null,

    rowIndex === rowCount / 2 &&
    th('.kv-table-cell-title.kv-cell-pos.kv-col-left', {
      rowSpan: (rowCount / 2),
    }, left) || null,

  ] || null
;

const renderTableRowEnd = (rowIndex, {right}) =>
  right !== null && (
  (rowIndex === 0 &&
    th('.kv-table-cell-title.kv-cell-neg.kv-col-right',
      `~${right}`)) ||
  (rowIndex === 1 &&
    th('.kv-table-cell-title.kv-cell-pos.kv-col-right', {
      rowSpan: 2,
    }, right)) ||
  (rowIndex === 3 &&
    th('.kv-table-cell-title.kv-cell-neg.kv-col-right',
      `${right}`))
  ) || null
;

const renderTableCell = (diagram, output, cell) => {
  const pattern = cell.getRange(0, diagram.inputs.size).toString(2);
  const value = diagram.outputs
    .get(output)
    .values
    .get(parseInt(cell, 2));
  const include = null && diagram.currentCube.include;
  const exclude = null && diagram.currentCube.exclude;
  const active = false && insideLoop(cell, include, exclude);
  const error = false;
  //&& active && !isValidLoopValue(diagram.get('mode'), value);

  return td('.kv-table-cell-body.kv-cell-atom',
    {
      className: [
        (active ? 'state-active' : null),
        (error ? 'state-error' : null),
      ].join(' '),
      attributes: {
        'data-kv-cell': cell.toString(2),
        'data-kv-pattern': pattern,
        'data-kv-value': value,
        'data-kv-output': output,
      },
    },
    renderValue(value)
  );
};

const tableLables = ({rows, cols, offset, inputs}) => ({
  top: _labelFor({inputs, offset}, cols, {
    include: 1,
    exclude: 0,
  }),
  bottom: _labelFor({inputs, offset}, cols, {
    include: 2,
    exclude: 1,
  }),
  left: _labelFor({inputs, offset}, rows, {
    include: Math.ceil(rows.length / 2),
    exclude: Math.ceil(rows.length / 2 - 1),
  }),
  right: _labelFor({inputs, offset}, rows, {
    include: 1,
    exclude: 3,
  }),
});

// generate a HTML Table from the given KV layout, kv data.
// offset is just needed for recursive calls
const renderTable = (
  layout,
  diagram,
  mode,
  output,
  offset = diagram.inputs.size
  ) => {
  const cols = layout.columns;
  const rows = layout.rows;
  const rowCount = rows.length;
  const colCount = cols.length;
  const labelOffset = offset - layout.count - 1;

  const labels = tableLables({
    rows,
    cols,
    offset: labelOffset,
    inputs: diagram.inputs,
  });

  return div('.kv-container', [
    // layout.treeHeight === 0 &&
    // null && renderLoops(
    //   diagram.loops.filter(
    //     (loop) => loopBelongsToOutput(loop, output)
    //   ), rows, cols) || null,

    table('.kv-table', {
      className: 'kv-mode-' + mode,
      attributes: {'data-kv-height': layout.treeHeight},
    }, [
      renderTableHead(colCount, labels),
      layout.grid.map((row, rowIndex) =>
        tr('.kv-table-row-body', [
          renderTableRowStart(rowIndex, rowCount, labels),
          row.map((cell) => {
            if (cell.children) {
              return td('.kv-table-cell-body.kv-cell-container', [
                renderTable(cell.children, diagram,
                  mode, output, labelOffset + 1),
              ]);
            } else {
              return renderTableCell(diagram, output, cell.scope);
            }
          }),
          renderTableRowEnd(rowIndex, labels),
        ])
      ),
      renderTableFoot(colCount, labels),
    ]),
  ]);
};

const renderToolbar = (state) =>
  div('#toolbar.toolbar', [
    button('.numberButton',
      {
        attributes: {'data-kv-counter': 'decrement'},
        disabled: state.diagram.inputs.size <= 0,
      },
      '-'),
    span('.input-count',
      {attributes: {'data-label': 'Inputs'}},
      state.diagram.inputs.size),
    button('.numberButton',
      {
        attributes: {'data-kv-counter': 'increment'},
        disabled: state.diagram.inputs.size >= 8,
      },
      '+'),
  ])
;

const renderLoopButton = (state, loop, index) =>
  li([
    button('.well', {
      style: {'background-color': loop.color},
      attributes: {
        'data-loop-index': index,
      },
    }, "X"),
    button('.well-delete', 'Delete'),
  ])
;

const renderModeButton = (state) => {
  const mode = state.currentMode;
  return button('.toggle-button', {attributes: {
    'data-kv-mode': (mode === 'dnf' ? 'knf' : 'dnf'),
  }},[
    span('.toggle-button-state', {
      className: (mode === 'dnf' ? 'state-active' : null),
    }, 'DNF'),
    span('.toggle-button-state', {
      className: (mode === 'knf' ? 'state-active' : null),
    }, 'KNF'),
  ]);
};

const renderLoopList = (state) =>
  div('.loop-list', [
    renderModeButton(state),
    span('.toolbar-title', 'Loops:'),
    ul('.inline-list', [
      state.diagram.loops.map((loop, i) =>
        renderLoopButton(state, loop, i)
      ).toArray(),
      //li(button('.well.well-add', 'Add Loop')),
    ]),
  ])
;

const renderOutputList = (state) =>
  div('.output-list', [
    span('.toolbar-title', 'Outputs:'),
    ul('.inline-list', [
      state.diagram.outputs.map((output, i, all) =>
        li(
          span('.pill' +
            (i === state.currentOutput ? '.state-active' : ''), {
              attributes: {
                'data-kv-output': i,
              },
            }, [
              output.name,
              all.size > 1 && button('.pill-delete', {attributes: {
                'data-kv-remove-output': i,
              }}, 'X') || null,
            ]
          )
        )
      ).toArray(),
      state.diagram.outputs.size < 4 && li(
        button('.pill', {attributes: {'data-kv-add-output': true}},'+')
      ) || null,
      //li(button('.well.well-add', 'Add Loop')),
    ]),
  ])
;

const renderBody = (layout, state) =>
  renderTable(
    layout,
    state.diagram,
    state.currentMode,
    state.currentOutput
  )
;

const renderTableContainer = (layout, state) =>
  div('.scroller', [
    div('.scoller-inner', [
      renderBody(layout, state),
    ]),
  ])
;

const render = ({state, layout}) =>
  div([
    renderToolbar(state),
    renderLoopList(state),
    renderOutputList(state),
    renderTableContainer(layout, state),
  ]);

export default (state$, {helpBox$}) =>
  O.just(div([
    helpBox$,
    state$.map(render),
  ]))
;
