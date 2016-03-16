import {Observable as O} from 'rx';
import isolate from '@cycle/isolate';
import {wrapInDiv} from '../../lib/dom-helper';

import graphics from '../graphics';

import model from './model';
import view from './view';
import intent from './intent';

export default ({
  DOM, // DOM driver source
  globalEvents, // globalEvent driver source
  props$ = O.just({
    scaleX: 100, // the horizontal spacing between nodes
    scaleY: 100, // the vertical spacing between nodes
  }),
  data$ = O.just({ // The tree simply as nested objects.
    name: "Root", // The name of the node
    color: 'black', // The color of the node
    hidden: false, // If the node should be faded out
    children: [ // The child nodes
    // {
    //   name: "Child",
    //   color: ...,
    //   hidden: false,
    //   children: [...]
    // },
    ],
  }),
}) => {
  const {isolateSource, isolateSink} = DOM;
  const actions = intent(isolateSource(DOM, 'graphicsContent'));
  const state$ = model(props$, data$, actions);
  const vtree$ = view(state$);

  const stage = isolate(graphics, 'mygraphics')({
    DOM,
    globalEvents,
    props$: O.just({
      width: 600,
      height: 600,
    }),
    camera$: O.just({x: 0, y: 0, zoom: 1}),
    bounds$: state$.map((o) => o.bounds),
    content$: isolateSink(vtree$, 'graphicsContent'),
    autoCenter$: state$.map(() => true),
  });

  return {
    DOM: stage.DOM.map(wrapInDiv),
    preventDefault: O.merge([
      actions.preventDefault,
      stage.preventDefault,
    ]),
  };
};
