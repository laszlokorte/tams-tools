import model from './model';
import view from './view';
import intent from './intent';

import {pluck} from '../../lib/utils';

export default (responses) => {
  const {
    DOM,
    props$,
  } = responses;

  const size$ = props$
    .map(pluck('size'))
    .startWith({width: 1200, height: 600});
  const cameraPosition$ = props$
    .map(pluck('cameraPosition'))
    .startWith({x: 0, y: 0});
  const cameraZoom$ = props$
    .map(pluck('cameraZoom'))
    .startWith(1);

  const actions = intent(DOM);
  const state$ = model(size$, cameraPosition$, cameraZoom$, actions);
  const vtree$ = view(state$);

  return {
    DOM: vtree$,
  };
};
