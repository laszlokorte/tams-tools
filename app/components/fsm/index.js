import {Observable as O} from 'rx';
import toGraph from './lib/graph';
import intent from './intent';
import model from './model';
import view from './view';

export default (sources) => {
  const {
    DOM,
    props$,
    inital$ = O.empty(),
  } = sources;

  const actions = intent(DOM);
  const state$ = model(inital$, actions).shareReplay(1);
  const vtree$ = view(state$);

  return {
    DOM: vtree$,
    preventDefault: actions.preventDefault,
    graph$: state$.map((fsmViewState) => {
      return toGraph(fsmViewState.fsm);
    }),
  };
};
