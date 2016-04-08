import {Observable as O} from 'rx';
import I from 'immutable';

import * as FSM from '../lib/state-machine';
import * as SIMULATOR from '../lib/simulation';

import {generateUnique} from './unique';

const fsmViewState = I.Record({
  fsm: FSM.newMachine(),
  simulation: SIMULATOR.newSimulation(),
  currentEditMode: 'edit',
}, 'fsmViewState');

const resetSimulation = (state) =>
  state.update('simulation', (simulation) =>
    SIMULATOR.reset(simulation)
  )
;

const addInput = (state) =>
  resetSimulation(state)
  .update('fsm', (fsm) =>
    FSM.addInput(
      "Input " + (fsm.inputs.size + 1),
      fsm
    )
  )
;

const addOutput = (state) =>
  resetSimulation(state)
  .update('fsm', (fsm) =>
    FSM.addOutput(
      "Output " + (fsm.outputs.size + 1),
      fsm
    )
  )
;

const removeInput = (state, inputIndex) =>
  resetSimulation(state)
  .update('fsm', (fsm) =>
    FSM.removeInput(fsm, inputIndex)
  )
;

const removeOutput = (state, outputIndex) =>
  resetSimulation(state)
  .update('fsm', (fsm) =>
    FSM.removeOutput(fsm, outputIndex)
  )
;

const setType = (state, type) =>
  resetSimulation(state)
  .update('fsm', (fsm) =>
    FSM.setType(fsm, FSM.typeFromString(type))
  )
;

const switchEditMode = (state, mode) =>
  state.set('currentEditMode', mode)
;

const stateName = (n) =>
  `S${n + 1}`
;

const addState = (position, state) =>
  state.update('fsm', (fsm) =>
    FSM.addState(
      generateUnique(
        stateName,
        state.fsm.states
        .map((s) => s.name)
        .toSet()
      )
    , position, fsm)
  )
;

const moveState = ({index, x, y}, state) =>
  state.update('fsm', (fsm) =>
    FSM.moveState(index, {x, y}, fsm)
  )
;

const addTransition = (fromIndex, toIndex, state) =>
  state.update('fsm', (fsm) =>
    FSM.addTransition(fromIndex, toIndex, fsm)
  )
;

const removeState = (index, state) =>
  state.update('fsm', (fsm) =>
    FSM.removeState(index, fsm)
  )
;

const removeTransition = (fromIndex, toIndex, state) =>
  state.update('fsm', (fsm) =>
    FSM.removeTransition(fromIndex, toIndex, fsm)
  )
;

const modifiers = (actions) => {
  return O.merge([
    actions.addInput$.map(() => (state) => {
      return addInput(state);
    }),
    actions.addOutput$.map(() => (state) => {
      return addOutput(state);
    }),
    actions.removeInput$.map((inputIndex) => (state) => {
      return removeInput(state, inputIndex);
    }),
    actions.removeOutput$.map((outputIndex) => (state) => {
      return removeOutput(state, outputIndex);
    }),
    actions.switchEditMode$.map((mode) => (state) => {
      return switchEditMode(state, mode);
    }),
    actions.setType$.map((type) => (state) => {
      return setType(state, type);
    }),
    actions.addState$.map((position) => (state) => {
      return addState(position, state);
    }),
    actions.moveState$.map((movement) => (state) => {
      return moveState(movement, state);
    }),
    actions.addTransition$.map(({fromIndex, toIndex}) => (state) => {
      return addTransition(fromIndex, toIndex, state);
    }),
    actions.removeState$.map((index) => (state) => {
      return removeState(index, state);
    }),
    actions.removeTransition$.map(({fromIndex, toIndex}) => (state) => {
      return removeTransition(fromIndex, toIndex, state);
    }),
  ]);
};

const initialState = fsmViewState();

const stateFromJson = () =>
  fsmViewState()
;

const applyModification = (prev, modfn) => {
  return modfn(prev);
};

export default (initial$, actions) =>
  initial$
  .map(stateFromJson)
  .startWith(initialState)
  .map((initial) =>
    modifiers(actions)
    .startWith(initial)
    .scan(applyModification)
    .distinctUntilChanged(
      (s) => s,
      (a, b) => a === b
    )
  )
  .switch()
  .shareReplay(1)
;
