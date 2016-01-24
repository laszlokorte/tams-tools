import I from 'immutable';

const column = I.Record({
  name: null,
}, 'column');

const columnGroup = I.Record({
  name: null,
  columns: I.List(),
}, 'columnGroup');

const row = I.Record({
  values: I.List(),
}, 'row');

const table = I.Record({
  columnGroups: I.List(),
  rows: I.List(),
}, 'table');

export const fromJSON = (data) => {
  return data ? table({
    columnGroups: I.List(data.columnGroups).map(
      (group) => columnGroup({
        name: group.name.toString(),
        columns: I.List(group.columns).map(column),
      })
    ),
    rows: I.List(data.rows).map(row),
  }) : null;
};
