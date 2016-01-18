import model from './model';
import view from './view';
import intent from './intent';

import toTree from './lib/tree';

export default (responses) => {
  const {
    DOM,
    keydown,
  } = responses;

  const actions = intent(DOM, keydown);
  const state$ = model(actions);
  const vtree$ = view(state$);

  return {
    DOM: vtree$,
    preventDefault: actions.preventDefault,
    tree$: state$.debounce(200).map(
      (state) => state && state.expressions &&
        state.expressions.size > 0 ?
        toTree(state.expressions.get(0)) : null
    ),
  };
};
