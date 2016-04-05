import {Observable as O} from 'rx';
import toGraph from './lib/graph';
import intent from './intent';
import model from './model';
import view from './view';

// initialize the fsm component
export default ({
  DOM, // DOM driver source
  globalEvents, // globalEvent driver sources
  inital$ = O.empty(), // The intial FSM data
}) => {
  const actions = intent(DOM, globalEvents);
  const state$ = model(inital$, actions);
  const vtree$ = view(state$);

  return {
    DOM: vtree$,
    preventDefault: actions.preventDefault,
    graph$: state$.map((fsmViewState) => {
      return toGraph(fsmViewState.fsm);
    }),
    mode$: state$.map((s) => s.currentEditMode),
  };
};
