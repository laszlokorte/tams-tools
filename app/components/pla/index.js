import {Observable as O} from 'rx';
import isolate from '@cycle/isolate';
import {div} from '@cycle/dom';

import {pluck} from '../../lib/utils';
import graphics from '../graphics';

import {plaFromJson} from './lib/pla';
import model from './model';
import view from './view';
import costPanel from './view/cost-panel';
import intent from './intent';

export default (responses) => {
  const {
    DOM,
    props$,
    data$,
  } = responses;

  const pla$ = data$.map(plaFromJson);
  const {isolateSource, isolateSink} = DOM;
  const actions = intent(isolateSource(DOM, 'graphicsContent'));
  const state$ = model(props$, pla$, actions).shareReplay(1);
  const vtree$ = view(state$);

  const stage = isolate(graphics, 'mygraphics')({
    DOM,
    props$: O.just({
      width: 1200,
      height: 600,
    }),
    camera$: O.just({x: 0, y: 0, zoom: 1}),
    bounds$: state$.map(pluck('bounds')),
    content$: isolateSink(vtree$, 'graphicsContent'),
  });

  return {
    DOM: O.combineLatest(
      pla$.map(costPanel),
      stage.DOM,
      (plaEl, stageEl) => div([
        plaEl,
        stageEl,
      ])
    ),
    preventDefault: O.merge(
      actions.preventDefault,
      stage.preventDefault
    ),
  };
};
