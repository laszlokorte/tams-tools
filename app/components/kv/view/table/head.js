import {
  tr, th,
} from '@cycle/dom';

export default (colCount, {top, left, right, bottom}) =>
  top !== null &&
  tr('.kv-table-row-title.kv-row-top', {
    key: 'head-row',
  }, [
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
