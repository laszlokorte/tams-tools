import model from './model';
import view from './view';
import intent from './intent';

import {pluck} from '../../lib/utils';

export default (responses) => {
  const {
    DOM,
    props$,
    camera$,
    bounds$,
  } = responses;

  const actions = intent(DOM);
  const state$ = model(props$, camera$, bounds$, actions);
  const vtree$ = view(state$);

  return {
    DOM: vtree$,
  };
};
