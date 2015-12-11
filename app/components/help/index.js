import {Observable as O} from 'rx';

import model from './model';
import view from './view';
import intent from './intent';

import {pluck} from '../../lib/utils';

export default (responses) => {
  const {
    DOM,
    props$
  } = responses;

  const visible$ = props$
    .map(pluck('visible'));

  const content$ = props$.map(pluck('content'));

  const state$ = model(visible$, content$, intent(DOM));
  const vtree$ = view(state$);

  return {
    DOM: vtree$,
  };
};
