import I from 'immutable';

// a table column
const column = I.Record({
  name: null,
}, 'column');

// a group of columns
const columnGroup = I.Record({
  name: null,
  columns: I.List(),
}, 'columnGroup');

// a table row
const row = I.Record({
  values: I.List(), // the rows values
}, 'row');

// object representing a table
const table = I.Record({
  columnGroups: I.List(), // the groups of columns
  rows: I.List(), // list of rows
  selectedRow: null, // index of the selected row
  error: null, // error message that should be shown instead of the rows
}, 'table');

// create a table from a plain object
export const fromJSON = (data) => {
  const selectedRow =
    (data && data.selectedRow !== void 0) ?
    data.selectedRow : null;

  return data ? table({
    columnGroups: I.List(data.columnGroups).map(
      (group) => columnGroup({
        name: group.name.toString(),
        columns: I.List(group.columns).map(column),
      })
    ),
    rows: I.List(data.rows).map(row),
    selectedRow,
    error: data.error,
  }) : null;
};
