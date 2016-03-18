import {Observable as O} from 'rx';

import model from './model';
import view from './view';
import intent from './intent';

// initialize text field for entering logic expressions
export default ({
  DOM, // DOM driver source
  globalEvents, // globalEvent driver sources
  input$ = O.just({ // The text initial value of the input field
    langId: "auto", // The selected language
    term: "", // The value of the text field
  }),
  props$ = O.just({
    showCompletion: true, // if buttons for inserting syntax tokens
                          // should be shown above the text field
  }),
}) => {
  const actions = intent({
    DOM,
    globalEvents,
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
