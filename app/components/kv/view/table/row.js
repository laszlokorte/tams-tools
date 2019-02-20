import {
  th, span,
} from '@cycle/dom';

import {labelCell} from './labelCell';

export const renderTableRowStart = (
  rowIndex, rowCount, {left}, inputsEditable
  ) =>
  left !== null && [
    rowIndex === 0 &&
    th('.kv-table-cell-title.kv-cell-neg.kv-col-left', {
      rowSpan: (rowCount / 2),
      colSpan: 2,
    }, [
      span(`~${left.name}`),
  ]) || null,

    rowIndex === rowCount / 2 &&
    th('.kv-table-cell-title.kv-cell-pos.kv-col-left-edit', {
      rowSpan: (rowCount / 2),
    }, labelCell(left, inputsEditable)) || null,

    rowIndex === rowCount / 2 &&
    th('.kv-table-cell-title.kv-cell-pos.kv-col-left', {
      rowSpan: (rowCount / 2),
    }, span(`${left.name}`)) || null,

  ] || null
;

export const renderTableRowEnd = (rowIndex, {right}, inputsEditable) =>
  right !== null && (
  (rowIndex === 0 &&
    th('.kv-table-cell-title.kv-cell-neg.kv-col-right',
      {colSpan: 2}, [
      span(`~${right.name}`),
    ])) ||
  (rowIndex === 1 && [
    th('.kv-table-cell-title.kv-cell-pos.kv-col-right', {
      rowSpan: 2,
    }, span(`${right.name}`)),
    th('.kv-table-cell-title.kv-cell-pos.kv-col-right-edit', {
      rowSpan: 2,
    }, labelCell(right, inputsEditable)),
  ]) ||
  (rowIndex === 3 &&
    th('.kv-table-cell-title.kv-cell-neg.kv-col-right',
    span(`${right.name}`))
  )
  ) || null
;
