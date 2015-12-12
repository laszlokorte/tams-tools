import {Observable as O} from 'rx';
import {
  div,
} from '@cycle/dom';

export default (state$, {helpBox$, inputSpinner$, modeSwitch$, canvas$}) =>
  O.just(div([
    helpBox$,
    inputSpinner$,
    modeSwitch$,
    canvas$,
  ]))
;
