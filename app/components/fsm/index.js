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
  graphAction$ = O.empty(), // commands that modify the graph
}) => {
  const actions = intent(DOM, globalEvents, graphAction$);
  const state$ = model(inital$, actions);
  const vtree$ = view(state$);

  return {
    DOM: vtree$,
    preventDefault: actions.preventDefault,
    graph$: state$.map((fsmViewState) => {
      return toGraph(fsmViewState.fsm);
    }).share(),
    mode$: state$
      .map((s) => s.currentEditMode)
      .distinctUntilChanged(
        (s) => s,
        (a, b) => a === b
      ).share(),
  };
};
