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
    autoResize: actions.autoResize,
    tree$: state$.debounce(200).map(
      (state) => {
        if (state &&
          state.expressions &&
          state.expressions.size > 0
        ) {
          if (state.expressions.size === 1) {
            return toTree(state.expressions.get(0), state.subEvalutation);
          } else {
            return {
              name: 'Expression List',
              children: state.expressions.map(
                (e) => toTree(e, state.subEvalutation)
              ).toArray(),
            };
          }
        } else {
          return null;
        }
      }
    ),
  };
};
