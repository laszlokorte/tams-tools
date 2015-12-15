import {Observable as O} from 'rx';
import {
  div,
} from '@cycle/dom';

export default (state$, {helpBox$, inputSpinner$, modeSwitch$, canvas$, modePanel$}) =>
  O.just(div([
    helpBox$,
    inputSpinner$,
    modePanel$,
    modeSwitch$,
    canvas$,
  ]))
;
