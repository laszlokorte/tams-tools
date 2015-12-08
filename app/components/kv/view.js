import {
  h1, div, p, button ,span, ul, li,
  table, tr, th, td,
} from '@cycle/dom';

import './view.styl';

import {highestBit, formatBinary} from '../../lib/utils';

// convert a cell's value into a string
const renderKvValue = (val) => {
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

// render a percentually positioned loop of a given color
// rows: the number of rows of the kv leaf grid
// cols: the number of columns
// xa: 0-based index of the column the loop starts
// ya: 0-based index of the row the loop starts
// xb, yb: indices of the rows/columns where the loop ends
const renderVKLoop = ({color, rows, cols, xa, ya, xb, yb}) => {
  const width = xb - xa + 1;
  const height = yb - ya + 1;

  const left = Math.floor(100 * xa / cols);
  const top = Math.floor(100 * ya / rows);
  const right = Math.ceil(100 * (cols - width) / cols) - left;
  const bottom = Math.ceil(100 * (rows - height) / rows) - top;

  if (left < 0 || top < 0 || right < 0 || bottom < 0) {
    return '';
  }

  return div('.kv-loop', {
    style: {
      top: `${top}%`,
      right: `${right}%`,
      bottom: `${bottom}%`,
      left: `${left}%`,
      'border-color': color,
    },
  });
};

// Render the collection of loops for a kv leaf grid
// rows, cols: number of rows and columns
const renderKVLoops = (rows, cols) => {
  const padding =
    (cols > 1 ? '.kv-loop-padding-top' : '') +
    (rows > 2 ? '.kv-loop-padding-right' : '') +
    (cols > 3 ? '.kv-loop-padding-bottom' : '') +
    (rows > 1 ? '.kv-loop-padding-left' : '');

  return div('.kv-loops-container' + padding, [
    renderVKLoop({color: '#E91E63', rows, cols, xa: 0, ya: 0, xb: 0, yb: 0}),
    renderVKLoop({color: '#FF9800', rows, cols, xa: 0, ya: 1, xb: 1, yb: 2}),
    renderVKLoop({color: '#FF5252', rows, cols, xa: 2, ya: 0, xb: 3, yb: 3}),
    renderVKLoop({color: '#9C27B0', rows, cols, xa: 0, ya: 3, xb: 3, yb: 3}),
  ]);
};

const _labelFor = ({variables, offset}, rowsOrColumns, {include, exclude}) =>
  rowsOrColumns.length > include &&
  rowsOrColumns.length > exclude &&
  variables.get(
    offset +
    highestBit(
      ~rowsOrColumns[exclude] &
      rowsOrColumns[include]
    )
  ) || null
;

const renderTableHead = (colCount, {top, left, right, bottom}) => [
  top &&
  tr('.kv-table-row-title.kv-row-top',[
    left !== null &&
    th('.kv-table-corner') || null,

    top &&
    th('.kv-table-cell-title.kv-cell-neg', `~${top}`) || null,

    top &&
    th('.kv-table-cell-title.kv-cell-pos',
      {colSpan: colCount / 2}, top) || null,

    bottom &&
    th('.kv-table-cell-title.kv-cell-neg',
      `~${top}`) || null,

    right !== null && th('.kv-table-corner') || null,
  ]) || null,
];

const renderTableFoot = (colCount, {left, right, bottom}) => [
  tr('.kv-table-row-title.kv-row-bottom',[
    left !== null &&
    th('.kv-table-corner') || null,

    bottom &&
    th('.kv-table-cell-title.kv-cell-neg',
      {colSpan: colCount / 2}, `~${bottom}`) || null,

    bottom &&
    th('.kv-table-cell-title.kv-cell-pos',
      {colSpan: colCount / 2}, bottom) || null,

    right !== null &&
    th('.kv-table-corner') || null,
  ]),
];

const renderTableRowStart = (rowIndex, rowCount, {left}) =>
  left && [
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

const renderTableCell = (kv, column) => {
  const pattern = formatBinary(column.scope, kv.get('variables').size);
  const scope = kv.get('data').get(column.scope);
  const include = kv.get('loop').get('include');
  const exclude = kv.get('loop').get('exclude');
  const active =
    (include & column.scope) === include &&
    (exclude & column.scope) === 0;
  const error = active && (scope === false);

  return td('.kv-table-cell-body.kv-cell-atom',
    {
      className: [
        (active ? 'state-active' : null),
        (error ? 'state-error' : null),
      ].join(' '),
      attributes: {
        'data-kv-offset': column.scope,
        'data-kv-pattern': pattern,
        'data-kv-value': scope,
      },
    },
    renderKvValue(scope)
  );
};

const tableLables = ({rows, cols, offset, variables}) => ({
  top: _labelFor({variables, offset}, cols, {
    include: 1,
    exclude: 0,
  }),
  bottom: _labelFor({variables, offset}, cols, {
    include: 2,
    exclude: 1,
  }),
  left: _labelFor({variables, offset}, rows, {
    include: rows.length / 2,
    exclude: rows.length / 2 - 1,
  }),
  right: _labelFor({variables, offset}, rows, {
    include: 1,
    exclude: 3,
  }),
});

// generate a HTML Table from the given KV layout, kv data.
// offset is just needed for recursive calls
const renderTable = (layout, kv, offset = kv.get('variables').size) => {
  const cols = layout.columns;
  const rows = layout.rows;
  const rowCount = rows.length;
  const colCount = cols.length;
  const labelOffset = offset - layout.count - 1;

  const labels = tableLables({
    rows,
    cols,
    offset: labelOffset,
    variables: kv.get('variables'),
  });

  return div('.kv-container', [
    layout.treeHeight === 0 && renderKVLoops(rowCount, colCount) || null,
    table('.kv-table', {
      attributes: {'data-kv-height': layout.treeHeight},
    }, [
      renderTableHead(colCount, labels),
      layout.grid.map((row, rowIndex) =>
        tr('.kv-table-row-body', [
          renderTableRowStart(rowIndex, rowCount, labels),
          row.map((column) => {
            if (column.children) {
              return td('.kv-table-cell-body.kv-cell-container', [
                renderTable(column.children, kv, labelOffset + 1),
              ]);
            } else {
              return renderTableCell(kv, column);
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
        disabled: state.kv.get('variables').size <= 0,
      },
      '-'),
    span('.input-count',
      {attributes: {'data-label': 'Inputs'}},
      state.kv.get('variables').size),
    button('.numberButton',
      {
        attributes: {'data-kv-counter': 'increment'},
        disabled: state.kv.get('variables').size >= 9,
      },
      '+'),
  ])
;

const renderLoop = (state, loop) =>
  li([
    button('.well', {style: {'background-color': loop.get('color')}}, "2"),
    button('.well-delete', 'Delete'),
  ])
;

const renderLoopList = (state) =>
  div('#loopTarget.loop-list', [
    span('.toolbar-title', 'Loops:'),
    ul('.inline-list', [
      state.kv.get('loops').map((loop) => renderLoop(state, loop)).toArray(),
      li(button('.well.well-add', 'Add Loop')),
    ]),
  ])
;

const renderBody = (state) =>
  renderTable(state.layout, state.kv)
;

const renderTableContainer = (state) =>
  div('.scroller', [
    div('#tableTarget', [
      renderBody(state),
    ]),
  ])
;

const render = (state) =>
  div([
    h1('KV Diagram'),
    div('.explaination', [
      p('Change the amount of input variables.'),
      p('Click on the table cells to toggle the value.'),
      p('The loops are just a dummy layout test.'),
    ]),
    renderToolbar(state),
    renderLoopList(state),
    renderTableContainer(state),
  ]);

export default (state$) =>
  state$.map(render)
;
