import I from 'immutable';

export const _simulation = I.Record({
  stateMachine: null,
  inputValues: I.List(),
  outputValues: I.List(),
}, 'simulation');
