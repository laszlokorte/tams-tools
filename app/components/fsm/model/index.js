import {Observable as O} from 'rx';
import I from 'immutable';

import {newMachine} from '../lib/state-machine';
import {newSimulation} from '../lib/simulation';

const fsmViewState = I.Record({
  fsm: newMachine(),
  simulation: newSimulation(),
}, 'fsmViewState');

const modifiers = () => {
  return O.empty();
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
