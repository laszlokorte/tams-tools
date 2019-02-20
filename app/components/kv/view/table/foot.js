/* eslint-disable complexity */

import {
  tr, th, span,
} from '@cycle/dom';

import {labelCell} from './labelCell';

export default (colCount, {left, right, bottom}, inputsEditable) =>
  bottom !== null && [
    tr('.kv-table-row-title.kv-row-bottom', {
      key: 'foot-row',
    }, [
      left !== null &&
      th('.kv-table-corner', {colSpan: 2}) || null,

      bottom !== null &&
      th('.kv-table-cell-title.kv-cell-neg',
        {colSpan: colCount / 2}, [
          span(`~${bottom.name}`),
      ]) || null,

      bottom !== null &&
      th('.kv-table-cell-title.kv-cell-pos',
        {colSpan: colCount / 2},
        span(`${bottom.name}`)
      ) || null,

      right !== null &&
      th('.kv-table-corner', {colSpan: 2}) || null,
    ]) || null,
    tr('.kv-table-row-edit.kv-row-bottom', {
      key: 'foot-row-edit',
    }, [
      left !== null &&
      th('.kv-table-corner-edit', {colSpan: 2}) || null,

      bottom !== null &&
      th('.kv-table-cell-edit.kv-cell-neg',
        {colSpan: colCount / 2}) || null,

      bottom !== null &&
      th('.kv-table-cell-edit.kv-cell-pos',
        {colSpan: colCount / 2}, labelCell(bottom, inputsEditable)) || null,

      right !== null &&
      th('.kv-table-corner-edit', {colSpan: 2}) || null,
    ]) || null,
  ]
;
