import I from 'immutable';

const _type = I.Record({
  name: null,
}, 'type');

export const TYPE_MOORE = _type({name: "moore"});
export const TYPE_MEALY = _type({name: "mealy"});

export const _stateMachine = I.Record({
  type: TYPE_MOORE,
  inputs: I.List(),
  outputs: I.List(),
  states: I.List(),
  initialState: null,
}, 'stateMachine');

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
  condition: '*',
}, 'transition');

export const typeFromString = (string) => {
  if (string === TYPE_MOORE.name) {
    return TYPE_MOORE;
  } else if (string === TYPE_MEALY.name) {
    return TYPE_MEALY;
  } else {
    return null;
  }
};

export const setType = (machine, type) =>
  machine.set('type', type)
;

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

export const setInitialValue = (machine, inputIndex, value) =>
  machine.updateIn(['inputs', inputIndex], (input) =>
    input.set('initialValue', value)
  )
;

export const addState = (name, position, machine) =>
  machine.update('states', (states) =>
    states.push(_state({
      name,
      position: _position(position),
    }))
  )
;

export const moveState = (stateIndex, pos, machine) =>
  machine.updateIn(['states', stateIndex, 'position'], (position) =>
    position.merge(pos)
  )
;

export const addTransition = (sourceIndex, targetIndex, machine) =>
  machine.updateIn(['states', sourceIndex, 'transitions'], (transitions) =>
    transitions.push(_transition({
      target: targetIndex,
    })).toOrderedSet().toList()
  )
;

const removeTransitionsTo = (stateIndex, state) =>
  state.update('transitions', (trans) =>
    trans
      .filter((t) => t.target !== stateIndex)
      .map((t) => t.update('target', (old) =>
        old < stateIndex ? old : old - 1
      )).toList()
  )
;

export const removeState = (stateIndex, fsm) =>
  fsm
    .removeIn(['states', stateIndex])
    .update('states', (states) =>
      states.map((state) => removeTransitionsTo(stateIndex, state))
    )
;

export const removeTransition = (fromIndex, toIndex, fsm) =>
  fsm.updateIn(['states', fromIndex,'transitions'], (transitions) =>
    transitions.filter((t) => t.target !== toIndex).toList()
  )
;

export const renameState = (name, stateIndex, fsm) =>
  fsm.updateIn(['states', stateIndex], (state) =>
    state.set('name', name)
  )
;

export const setTransitionCondition = (fromIndex, toIndex, condition, fsm) =>
  fsm.updateIn(['states', fromIndex, 'transitions'], (transitions) =>
    transitions.map((t) =>
      t.target === toIndex ? t.set('condition', condition) : t
    ).toList()
  )
;

export const newMachine = () => {
  return _stateMachine();
};
