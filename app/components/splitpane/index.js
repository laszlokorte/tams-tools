import {Observable as O} from 'rx';

import model from './model';
import view from './view';
import intent from './intent';

// initialize the split pane component
export default ({
  DOM, // DOM driver source
  globalEvents, // globalEvent driver sources
  props$ = O.just({
    proportion: 0.5, // the initial proportion of the two panes
  }),
  firstChild$, // virtual dom tree to display in the left pane
  secondChild$, // virtual dom tree to display in the right pane
}) => {
  const actions = intent(DOM, globalEvents);
  const state$ = model({
    props$,
    firstChild$: firstChild$,
    secondChild$: secondChild$,
  }, actions);

  const vtree$ = view(state$);

  return {
    DOM: vtree$,
    preventDefault: actions.preventDefault,
  };
};
