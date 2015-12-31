import model from './model';
import view from './view';
import intent from './intent';

import {pluck} from '../../lib/utils';

export default (responses) => {
  const {
    DOM,
    props$,
    enabled$,
  } = responses;

  const actions = intent(DOM);
  const state$ = model(props$, enabled$.startWith(false), actions);
  const vtree$ = view(state$);

  return {
    DOM: vtree$,
    enabled$: state$.map(pluck('enabled')),
    preventDefault: actions.preventDefault,
  };
};
