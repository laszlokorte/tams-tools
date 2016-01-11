import model from './model';
import view from './view';
import intent from './intent';

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
  };
};
