import model from './model';
import view from './view';
import intent from './intent';

import {pluck} from '../../lib/utils';

export default (responses) => {
  const {
    DOM,
    props$,
    content$,
  } = responses;

  const visible$ = props$
    .map(pluck('visible'));

  const state$ = model(visible$, content$, intent(DOM));
  const vtree$ = view(state$);

  return {
    DOM: vtree$,
    visible$: state$.map(pluck('visible')),
  };
};
