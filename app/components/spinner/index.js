import model from './model';
import view from './view';
import intent from './intent';

import {pluck} from '../../lib/utils';

export default (responses) => {
  const {
    DOM,
    props$,
  } = responses;

  const value$ = props$.map(pluck('value')).startWith(0);
  const min$ = props$.map(pluck('min')).startWith(-Infinity);
  const max$ = props$.map(pluck('max')).startWith(Infinity);

  const state$ = model(value$, min$, max$, intent(DOM));
  const vtree$ = view(state$);

  return {
    DOM: vtree$,
    value$: state$.map(pluck('value')),
  };
};
