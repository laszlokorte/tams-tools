import model from './model';
import view from './view';
import intent from './intent';

import {pluck} from '../../lib/utils';

export default (responses) => {
  const {
    DOM,
    props$,
    value$,
  } = responses;

  const actions = intent(DOM);
  const state$ = model(
    value$.startWith(0),
    props$,
    actions
  );
  const vtree$ = view(state$);

  return {
    DOM: vtree$,
    value$: state$.map(pluck('value')),
    preventDefault: actions.preventDefault,
  };
};
