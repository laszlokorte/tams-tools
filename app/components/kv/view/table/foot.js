/* eslint-disable complexity */

import {
  tr, th, span,
} from '@cycle/dom';

import {labelCell} from './labelCell';

export default (colCount, {left, right, bottom}, inputsEditable) =>
  bottom !== null && tr('.kv-table-row-title.kv-row-bottom', {
    key: 'foot-row',
  }, [
    left !== null &&
    th('.kv-table-corner') || null,

    bottom !== null &&
    th('.kv-table-cell-title.kv-cell-neg',
      {colSpan: colCount / 2}, [
        span(`~${bottom.name}`),
    ]) || null,

    bottom !== null &&
    th('.kv-table-cell-title.kv-cell-pos',
      {colSpan: colCount / 2}, labelCell(bottom, inputsEditable)) || null,

    right !== null &&
    th('.kv-table-corner') || null,
  ]) || null
;
