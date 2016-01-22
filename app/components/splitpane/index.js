import model from './model';
import view from './view';
import intent from './intent';

export default (responses) => {
  const {
    DOM,
    props$,
    firstChild$,
    secondChild$,
  } = responses;

  const actions = intent(DOM);
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
