import {
  div,
  table, tr, th, td,
  colgroup, col,
} from '@cycle/dom';

import {IF} from '../../../lib/h-helper';

import './index.styl';

const columnCount = (tableData) =>
  tableData.columnGroups.reduce(
    (sum, group) => sum + group.columns.size, 0
  )
;

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
    IF(tableData.error, () =>
      tr('.table-error-row', [td('.table-error-cell', {
        colSpan: columnCount(tableData),
      }, tableData.error
      )])
    ),
    tableData.rows.map(
      (row, i) => tr('.table-body-row', {
        className: IF(selectedIndex === i, () => 'state-selected'),
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
