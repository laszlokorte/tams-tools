/* eslint-disable complexity */

import {
  tr, th, span,
} from '@cycle/dom';

import {labelCell} from './labelCell';

export default (colCount, {top, left, right, bottom}, inputsEditable) =>
  top !== null &&
  tr('.kv-table-row-title.kv-row-top', {
    key: 'head-row',
  }, [
    left !== null &&
    th('.kv-table-corner') || null,

    top !== null &&
    th('.kv-table-cell-title.kv-cell-neg', [
      span(`~${top.name}`),
    ]) || null,

    top !== null &&
    th('.kv-table-cell-title.kv-cell-pos',
      {colSpan: colCount / 2}, labelCell(top, inputsEditable)) || null,

    bottom !== null &&
    th('.kv-table-cell-title.kv-cell-neg', [
      span(`~${top.name}`),
    ]) || null,

    right !== null && th('.kv-table-corner') || null,
  ]) || null
;
