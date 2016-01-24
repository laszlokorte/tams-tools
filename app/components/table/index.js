
import model from './model';
import view from './view';
import intent from './intent';

export default (sources) => {
  const {
    DOM,
    table$,
  } = sources;

  const actions = intent(DOM);
  const state$ = model(table$, actions).shareReplay(1);
  const vtree$ = view(state$);

  return {
    DOM: vtree$,
    selectedRow$: state$.map(
      ({selectedIndex}) => selectedIndex
    ),
  };
};
