import {
  div,
  table, tr, th, td,
  colgroup, col,
} from '@cycle/dom';

import './index.styl';

const renderTable = (tableData, selectedIndex) =>
  table('.table', [
    tableData.columnGroups.map(
      (group) => colgroup('.table-colgroup',
        group.columns.map(() =>
          col('.table-col')
        ).toArray()
      )
    ).toArray(),
    tr('.table-head-row',
      tableData.columnGroups.map(
        (group) => th('.table-head-cell-small', {
          colSpan: group.columns.size,
        }, group.name.toString())
      ).toArray()
    ),
    tr('.table-head-row',
      tableData.columnGroups.flatMap(
        (group) => group.columns.map((column) =>
          th('.table-head-cell', column.name.toString())
        )
      ).toArray()
    ),
    tableData.rows.map(
      (row, i) => tr('.table-body-row', {
        className: selectedIndex === i ? 'state-selected' : void 0,
        attributes: {
          'data-index': i,
        },
      }, row.values.map(
          (v) => td('.table-body-cell', v.toString())
        )
      )
    ).toArray(),
  ])
;

const render = ({table: tableData, selectedIndex}) =>
  div('.table-scroller', [
    div('.table-scroller-body', [
      tableData === null ? null :
      renderTable(tableData, selectedIndex),
    ]),
  ])
;

export default (state$) =>
  state$.map(render)
;
