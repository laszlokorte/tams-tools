import {Observable as O} from 'rx';

import model from './model';
import view from './view';
import intent from './intent';

export default (responses) => {
  const {
    DOM,
    //Storage
  } = responses;

  const state$ = model(O.empty(), intent(DOM));
  const vtree$ = view(state$);

  return {
    DOM: vtree$,
  };
};
