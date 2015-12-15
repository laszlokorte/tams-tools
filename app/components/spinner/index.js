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

  const state$ = model(
    value$.startWith(0),
    props$,
    intent(DOM)
  );
  const vtree$ = view(state$);

  return {
    DOM: vtree$,
    value$: state$.map(pluck('value')),
  };
};
