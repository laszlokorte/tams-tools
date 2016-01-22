import I from 'immutable';

const column = I.Record({
  name: null,
}, 'column');

const columnGroup = I.Record({
  columns: I.List(),
}, 'columnGroup');

const row = I.Record({
  values: I.List(),
}, 'row');

const table = I.Record({
  columnGroups: I.List(),
  rows: I.List(),
}, 'table');
