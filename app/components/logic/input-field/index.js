import {Observable as O} from 'rx';

import model from './model';
import view from './view';
import intent from './intent';

export default (responses) => {
  const {
    DOM,
    keydown,
    input$ = O.empty(),
    props$ = O.just({showCompletion: true}),
  } = responses;

  const actions = intent({
    DOM,
    keydown,
  });

  const state$ = model(props$, input$, actions);
  const vtree$ = view(state$);

  return {
    DOM: vtree$,
    preventDefault: actions.preventDefault,
    autoResize: actions.autoResize,
    insertString: actions.insertString$,
    output$: state$.map((state) => state.output),
  };
};
