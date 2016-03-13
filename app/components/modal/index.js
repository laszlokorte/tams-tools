import model from './model';
import view from './view';
import intent from './intent';

import {pluck} from '../../lib/utils';

export default (responses) => {
  const {
    DOM,
    props$,
    content$,
    keydown,
  } = responses;

  const visible$ = props$
    .map(pluck('visible'));

  const actions = intent(DOM, keydown);
  const state$ = model(visible$, content$, actions);
  const vtree$ = view(state$);

  return {
    DOM: vtree$,
    visible$: state$.map(pluck('visible')),
    preventDefault: actions.preventDefault,
  };
};
