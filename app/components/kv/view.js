import {Observable as O} from 'rx';

import {
  h1, div, p, button ,span, ul, li,
  table, tr, th, td,
  strong, br,
} from '@cycle/dom';

import {matchesLoop, isValidLoopValue} from './model';
import './view.styl';

import {highestBit, formatBinary} from '../../lib/utils';

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
  const include = loop.get('include');
  const exclude = loop.get('exclude');

  const fields = cols.map((col) =>
    matchesLoop(col & ~dontcare,
      include & ~dontcare,
      exclude & ~dontcare)
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

  const colMask = cols.reduce((a,b) => a | b);
  const rowMask = rows.reduce((a,b) => a | b);
  const scopeMask = colMask ^ rowMask;

  return div('.kv-loops-container' + padding,
    loops.map((loop) =>
      renderLoop({
        color: loop.get('color'),
        rowCount, colCount,
        x: calcLoopRange(scopeMask & rowMask, cols, loop),
        y: calcLoopRange(scopeMask & colMask, rows, loop),
      })
    ).toArray()
  );
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

const renderTableCell = (kv, output, column) => {
  const pattern = formatBinary(column.scope, kv.get('variables').size);
  const value = kv.get('outputs')
    .get(kv.get('currentOutput'))
    .get('values')
    .get(column.scope);
  const include = kv.get('currentLoop').get('include');
  const exclude = kv.get('currentLoop').get('exclude');
  const active = matchesLoop(column.scope, include, exclude);
  const error = active && !isValidLoopValue(kv.get('mode'), value);

  return td('.kv-table-cell-body.kv-cell-atom',
    {
      className: [
        (active ? 'state-active' : null),
        (error ? 'state-error' : null),
      ].join(' '),
      attributes: {
        'data-kv-offset': column.scope,
        'data-kv-pattern': pattern,
        'data-kv-value': value,
        'data-kv-output': output,
      },
    },
    renderValue(value)
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
const renderTable = (layout, kv, output, offset = kv.get('variables').size) => {
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
    layout.treeHeight === 0 &&
    renderLoops(
      kv.get('loops').filter(
        (loop) => loop.get('output') === output
      ), rows, cols) || null,

    table('.kv-table', {
      className: 'kv-mode-' + kv.get('mode'),
      attributes: {'data-kv-height': layout.treeHeight},
    }, [
      renderTableHead(colCount, labels),
      layout.grid.map((row, rowIndex) =>
        tr('.kv-table-row-body', [
          renderTableRowStart(rowIndex, rowCount, labels),
          row.map((column) => {
            if (column.children) {
              return td('.kv-table-cell-body.kv-cell-container', [
                renderTable(column.children, kv, output, labelOffset + 1),
              ]);
            } else {
              return renderTableCell(kv, output, column);
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
        disabled: state.kv.get('variables').size >= 8,
      },
      '+'),
  ])
;

const renderLoopButton = (state, loop, index) =>
  li([
    button('.well', {
      style: {'background-color': loop.get('color')},
      attributes: {
        'data-loop-index': index,
      },
    }, "X"),
    button('.well-delete', 'Delete'),
  ])
;

const renderModeButton = (state) => {
  const mode = state.kv.get('mode');
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
      state.kv.get('loops').map((loop, i) =>
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
      state.kv.get('outputs').map((output, i, all) =>
        li(
          span('.pill' +
            (i === state.kv.get('currentOutput') ? '.state-active' : ''), {
              attributes: {
                'data-kv-output': i,
              },
            }, [
              output.get('name'),
              all.count() > 1 && button('.pill-delete', {attributes: {
                'data-kv-remove-output': i,
              }}, 'X') || null,
            ]
          )
        )
      ).toArray(),
      state.kv.get('outputs').size < 4 && li(
        button('.pill', {attributes: {'data-kv-add-output': true}},'+')
      ) || null,
      //li(button('.well.well-add', 'Add Loop')),
    ]),
  ])
;

const renderDebug = (state) => {
  const include = state.kv.get('currentLoop').get('include');
  const exclude = state.kv.get('currentLoop').get('exclude');
  const size = state.kv.get('variables').size;

  return div('.debug-panel', (include ^ exclude) && [
    'include: ',
    formatBinary(include,
      size),
    ' - ',
    'exclude: ',
    formatBinary(exclude,
      size),
  ] || null);
};

const renderBody = (state) =>
  renderTable(state.layout, state.kv, state.kv.get('currentOutput'))
;

const renderTableContainer = (state) =>
  div('.scroller', [
    div('.scoller-inner', [
      renderBody(state),
    ]),
  ])
;

const renderHelp = (state) => [
  button('.button-help', {attributes: {'data-help': true}},'Help'),
  div('.explaination' + (!state.help ? '.state-hidden' : ''), [
    h1('KV Diagram'),
    ul('.help-list',[
      li([strong('Change Size:'), br(),
        'You can change the amount of inputs.',
        'This will change the KV-diagrams\'s dimensions.']),
      li([strong('Change Values:'), br(),
        'Click on the table cells to cycle the value.',
        br(), '(hold ALT key for reversed cycle direction)']),
      li([strong('Create loops:'), br(),
        'Drag between two cells while holding SHIFT to create a loop.']),
      li([strong('Remove loops:'), br(),
        'Click on a loop icon to delete the loop.']),
    ]),
    p(
      button('.button-big', {attributes: {'data-help': false}},'Close')
    ),
  ]),
];

const render = (state) =>
  div([
    renderToolbar(state),
    renderLoopList(state),
    renderOutputList(state),
    renderDebug(state),
    renderTableContainer(state),
  ]);

export default (state$, helpBox$, spinner$) =>
  O.just(div([
    helpBox$,
    spinner$,
    state$.map(render),
  ]))
;
