import I from 'immutable';

const column = I.Record({
  name: null,
}, 'column');

const row = I.Record({
  values: I.List(),
}, 'row');

const table = I.Record({
  columns: I.List(),
  rows: I.List(),
}, 'table');
