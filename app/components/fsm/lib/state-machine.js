import I from 'immutable';

export const _stateMachine = I.Record({
  type: null,
  inputs: I.List(),
  outputs: I.List(),
  states: I.List(),
  initialState: null,
}, 'stateMachine');

const _type = I.Record({
  name: null,
}, 'type');

export const TYPE_MOORE = _type({name: "moore"});
export const TYPE_MEALY = _type({name: "mealy"});

export const _input = I.Record({
  name: "",
  initialValue: false,
}, 'input');

export const _output = I.Record({
  name: "",
}, 'output');

export const _position = I.Record({
  x: 0,
  y: 0,
}, 'position');

export const _state = I.Record({
  name: "",
  position: _position(),
  transitions: I.List(),
  outputs: I.List(),
}, 'state');

export const _transition = I.Record({
  target: null,
  condition: null,
}, 'transition');

export const addInput = (name, machine) =>
  machine.update('inputs', (inputs) =>
    inputs.push(_input({name}))
  )
;

export const addOutput = (name, machine) =>
  machine.update('outputs', (outputs) =>
    outputs.push(_output({name}))
  )
;

export const removeInput = (machine, inputIndex) =>
  machine.deleteIn(['inputs', inputIndex])
;

export const removeOutput = (machine, outputIndex) =>
  machine.deleteIn(['outputs', outputIndex])
;

export const newMachine = () => {
  return _stateMachine();
};
