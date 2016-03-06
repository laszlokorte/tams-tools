import {Observable as O} from 'rx';

import model from './model';
import view from './view';
import intent from './intent';

export default (responses) => {
  const {
    DOM,
    keydown,
  } = responses;

  const actions = intent({
    DOM,
    keydown,
  });

  const state$ = model(O.empty(), actions).shareReplay(1);
  const vtree$ = view(state$);

  return {
    DOM: vtree$,
    preventDefault: actions.preventDefault,
    autoResize: actions.autoResize,
    insertString: actions.insertString$,
  };
};
