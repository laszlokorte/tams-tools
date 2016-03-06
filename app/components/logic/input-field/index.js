import {Observable as O} from 'rx';

import model from './model';
import view from './view';
import intent from './intent';

export default (responses) => {
  const {
    DOM,
    keydown,
    input$,
  } = responses;

  const actions = intent({
    DOM,
    keydown,
  });

  const state$ = model(input$, actions).shareReplay(1);
  const vtree$ = view(state$);

  return {
    DOM: vtree$,
    preventDefault: actions.preventDefault,
    autoResize: actions.autoResize,
    insertString: actions.insertString$,
    output$: state$.map((state) => state.output),
  };
};
