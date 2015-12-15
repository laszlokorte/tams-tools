import {Observable as O} from 'rx';
import {
  div,
} from '@cycle/dom';

export default (state$, children) => {
  const {
    helpBox$,
    inputSpinner$,
    outputSpinner$,
    modeSwitch$,
    canvas$,
    modePanel$,
  } = children;

  return O.just(div([
    helpBox$,
    inputSpinner$,
    modePanel$,
    modeSwitch$,
    outputSpinner$,
    canvas$,
  ]));
};
