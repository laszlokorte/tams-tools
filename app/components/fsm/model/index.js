import {Observable as O} from 'rx';
import I from 'immutable';

import * as FSM from '../lib/state-machine';
import * as SIMULATOR from '../lib/simulation';

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
      "Input X",
      fsm
    )
  )
;

const addOutput = (state) =>
  resetSimulation(state)
  .update('fsm', (fsm) =>
    FSM.addOutput(
      "Output X",
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
  ]);
};

const initialState = fsmViewState();

const stateFromJson = (json) =>
  fsmViewState()
;

const applyModification = (prev, modfn) => {
  return modfn(prev);
};

export default (initial$, actions) =>
    O.merge(
      initial$
      .map(stateFromJson)
      .startWith(initialState)
      .map((kv) => () => kv),
      modifiers(actions)
    ).scan(applyModification, null)
    .distinctUntilChanged(
      (s) => s,
      (a, b) => a === b
    )
;
