import {Observable as O, Subject} from 'rx';

import toGraph from './lib/graph';

import intent from './intent';
import model from './model';
import view from './view';

import modalPanels from './panels';

// initialize the fsm component
export default ({
  DOM, // DOM driver source
  globalEvents, // globalEvent driver sources
  inital$ = O.empty(), // The intial FSM data
  graphAction$ = O.empty(), // commands that modify the graph
  graphSelection$ = O.empty(), // selected state or edge
}) => {
  const openData$ = new Subject();

  const actions = intent(DOM, globalEvents, graphAction$, openData$);
  const state$ = model(inital$, actions);

  const panels = modalPanels({
    DOM, globalEvents,
    open$: actions.panel$,
    jsonData$: O.empty(),
  });

  const vtree$ = view(
    state$,
    graphSelection$.startWith(null),
    O.combineLatest(
      Object.values(panels).map((p) => p.DOM)
    )
  );

  panels.open.data$.subscribe(openData$);

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
    resetSelection$: actions.closeProperties$,
  };
};
