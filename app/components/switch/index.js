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

  const state$ = model(props$, enabled$.startWith(false), intent(DOM));
  const vtree$ = view(state$);

  return {
    DOM: vtree$,
    enabled$: state$.map(pluck('enabled')),
  };
};
