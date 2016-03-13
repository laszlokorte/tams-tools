import {Observable as O} from 'rx';
import isolate from '@cycle/isolate';
import {div} from '@cycle/dom';

import graphics from '../graphics';

import intent from './intent';
import model from './model';
import view from './view';

export default (sources) => {
  const {
    DOM,
    bitCount$,
    globalEvents,
  } = sources;

  const {isolateSource, isolateSink} = DOM;

  const actions = intent(isolateSource(DOM, 'graphicsContent'));
  const state$ = model(bitCount$, actions);
  const vtree$ = view(state$);

  const stage = isolate(graphics, 'mygraphics')({
    DOM,
    globalEvents,
    props$: O.just({
      width: 600,
      height: 600,
    }),
    camera$: O.just({x: 0, y: 0, zoom: 1}),
    bounds$: state$.map((s) => s.bounds),
    autoCenter$: state$.map((s) => s.bounds).distinctUntilChanged(),
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
