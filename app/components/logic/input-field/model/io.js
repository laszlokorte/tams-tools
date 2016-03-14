import I from 'immutable';

export const input = I.Record({
  langId: 'auto',
  string: '',
}, 'input');

export const output = I.Record({
  language: null,
  network: null,
  error: null,
}, 'output');

export const error = I.Record({
  message: null,
  location: null,
}, 'error');
