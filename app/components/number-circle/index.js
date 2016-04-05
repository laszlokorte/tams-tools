import {Observable as O} from 'rx';
import isolate from '@cycle/isolate';
import {wrapInDiv} from '../../lib/dom-helper';

import graphics from '../graphics';

import intent from './intent';
import model from './model';
import view from './view';

// initialize the number circle component
export default ({
  DOM, // DOM driver source
  globalEvents, // globalEvent driver sources
  bitCount$ = O.just(3), // the number of bit's the circle should display
  encoding$ = O.just('signed'),
}) => {
  const {isolateSource, isolateSink} = DOM;

  const actions = intent(isolateSource(DOM, 'graphicsContent'));
  const state$ = model(encoding$, bitCount$, actions);
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
    autoCenter$: state$.map((s) => s.bounds)
      .distinctUntilChanged().map(() => true),
    content$: isolateSink(vtree$, 'graphicsContent'),
  });

  return {
    DOM: stage.DOM.map(wrapInDiv),
    preventDefault: O.merge([
      actions.preventDefault,
      stage.preventDefault,
    ]),
    stopPropagation: actions.stopPropagation,
  };
};
