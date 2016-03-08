import {Observable as O} from 'rx';
import isolate from '@cycle/isolate';
import {div} from '@cycle/dom';

import graphics from '../graphics';

import model from './model';
import view from './view';
import intent from './intent';

export default (responses) => {
  const {
    DOM,
    globalEvents,
    props$,
    data$,
  } = responses;

  const {isolateSource, isolateSink} = DOM;
  const actions = intent(isolateSource(DOM, 'graphicsContent'));
  const state$ = model(props$, data$, actions).shareReplay(1);
  const vtree$ = view(state$);

  const stage = isolate(graphics, 'mygraphics')({
    DOM,
    globalEvents,
    props$: O.just({
      width: 1200,
      height: 600,
    }),
    camera$: O.just({x: 0, y: 0, zoom: 1}),
    bounds$: state$.map((o) => o.bounds),
    content$: isolateSink(vtree$, 'graphicsContent'),
    autoCenter$: state$.map(() => true),
  });

  return {
    DOM: stage.DOM.map((e) => div([e])),
    preventDefault: O.merge([
      actions.preventDefault,
      stage.preventDefault,
    ]),
  };
};
