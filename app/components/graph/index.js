import {Observable as O} from 'rx';
import isolate from '@cycle/isolate';
import {div} from '@cycle/dom';

import {pluck} from '../../lib/utils';
import graphics from '../graphics';

import {graphFromJson} from './lib/graph';
import model from './model';
import view from './view';
import intent from './intent';

export default (responses) => {
  const {
    DOM,
    props$,
    data$,
    globalEvents,
  } = responses;

  const graph$ = data$.map(graphFromJson);
  const {isolateSource, isolateSink} = DOM;
  const actions = intent(isolateSource(DOM, 'graphicsContent'));
  const state$ = model(props$, graph$, actions).shareReplay(1);
  const vtree$ = view(state$);

  const stage = isolate(graphics, 'mygraphics')({
    DOM,
    globalEvents,
    props$: O.just({
      width: 1200,
      height: 600,
    }),
    camera$: O.just({x: 0, y: 0, zoom: 1}),
    bounds$: state$.map(pluck('bounds')),
    content$: isolateSink(vtree$, 'graphicsContent'),
  });

  return {
    DOM: stage.DOM.map(
      (stageEl) => div([
        stageEl,
      ])
    ),
    preventDefault: O.merge([
      actions.preventDefault,
      stage.preventDefault,
    ]),
    stopPropagation: actions.stopPropagation,
  };
};
