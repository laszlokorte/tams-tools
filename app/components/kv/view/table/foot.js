import {
  tr, th,
} from '@cycle/dom';

export default (colCount, {left, right, bottom}) =>
  bottom !== null && tr('.kv-table-row-title.kv-row-bottom', {
    key: 'foot-row',
  }, [
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
