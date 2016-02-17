import I from 'immutable';

const context = I.Record({
  freeIdentifiers: I.Set(),
  declaredIdentifiers: I.Set(),
  expressions: I.List(),
}, 'context');
