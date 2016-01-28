import {Observable as O} from 'rx';
import I from 'immutable';

const fsmViewState = I.Record({
  fsm: null,
  simulation: null,
}, 'fsmViewState');

export default ({props$}, actions) => {
  return O.just(fsmViewState());
};
