import {Observable as O} from 'rx';

import model from './model';
import view from './view';
import intent from './intent';

export default (responses) => {
  const {
    DOM,
    globalEvents,
    props$,
    camera$,
    bounds$,
    content$,
    autoCenter$ = O.empty(),
  } = responses;

  const actions = intent(DOM, globalEvents);
  const state$ = model({
    props$, camera$, bounds$, content$, autoCenter$,
  }, actions);
  const vtree$ = view(state$);

  return {
    DOM: vtree$,
    preventDefault: actions.preventDefault,
  };
};
