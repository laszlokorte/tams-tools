import {
  div,
  table, tr, th, td,
} from '@cycle/dom';

import {padLeft} from '../../../lib/utils';

import {renderLoops} from './loops';

import {
  insideCube, isValidValueForMode,
  loopBelongsToOutput,
  cellToInt,
} from '../model/diagram';

import './table.styl';

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

const _labelFor = ({inputs, offset}, rowsOrColumns, {include, exclude}) => {
  if (rowsOrColumns.size > include &&
    rowsOrColumns.size > exclude
    ) {
    const intersect = rowsOrColumns.get(exclude).not().and(rowsOrColumns.get(include));
    return inputs.get(offset + intersect.msb()).name;
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

const renderTableCell = ({
  diagram, output, mode, cell,
  currentCube, className,
}) => {
  const value = diagram.outputs
    .get(output)
    .values
    .get(cellToInt(cell));

  const active = insideCube(cell, currentCube);
  const error = active && !isValidValueForMode(value, mode);

  return td('.kv-table-cell-body.kv-cell-atom' + className,
    {
      className: [
        (active ? 'state-active' : null),
        (error ? 'state-error' : null),
      ].join(' '),
      attributes: {
        'data-kv-cell': padLeft(cell.toString(2), diagram.inputs.size, '0'),
        'data-kv-index': cell.toString(10),
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
    include: Math.ceil(rows.size / 2),
    exclude: Math.ceil(rows.size / 2 - 1),
  }),
  right: _labelFor({inputs, offset}, rows, {
    include: 1,
    exclude: 3,
  }),
});

// generate a HTML Table from the given KV layout, kv data.
// offset is just needed for recursive calls
export const renderTable = ({
  layout,
  diagram,
  mode,
  output,
  currentCube,
  currentLoop,
  compact = false,
  labelOffset: offset = diagram.inputs.size,
  }) => {
  const cols = layout.columns;
  const rows = layout.rows;
  const rowCount = rows.size;
  const colCount = cols.size;
  const labelOffset = offset - layout.count;

  const labels = tableLables({
    rows,
    cols,
    offset: labelOffset,
    inputs: diagram.inputs,
  });

  const styleClass = (compact ? '.style-compact' : '');

  return div('.kv-container' + styleClass, [
    layout.treeHeight === 0 &&
    renderLoops(
      diagram.loops.filter(
        (loop) => loopBelongsToOutput(loop, output)
      ).toList().push(currentLoop), mode, rows, cols) || null,

    table('.kv-table' + styleClass, {
      className: 'kv-mode-' + mode.name,
      attributes: {'data-kv-height': layout.treeHeight},
    }, [
      compact ? null : renderTableHead(colCount, labels),
      layout.grid.map((row, rowIndex) =>
        tr('.kv-table-row-body', [
          compact ? null : renderTableRowStart(rowIndex, rowCount, labels),
          row.cells.map((cell) => {
            if (cell.children) {
              return td('.kv-table-cell-body.kv-cell-container' + styleClass, [
                renderTable({
                  layout: cell.children,
                  diagram, mode, output, currentCube, currentLoop, compact,
                  labelOffset}),
              ]);
            } else {
              return renderTableCell({
                diagram, output, mode,
                cell: cell.scope,
                currentCube,
                className: styleClass,
              });
            }
          }).toArray(),
          compact ? null : renderTableRowEnd(rowIndex, labels),
        ])
      ).toArray(),
      compact ? null : renderTableFoot(colCount, labels),
    ]),
  ]);
};
