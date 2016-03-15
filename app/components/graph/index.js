import {Observable as O} from 'rx';
import isolate from '@cycle/isolate';
import {div} from '@cycle/dom';

import {pluck} from '../../lib/utils';
import graphics from '../graphics';

import {graphFromJson} from './lib/graph';
import model from './model';
import view from './view';
import intent from './intent';

export default ({
  DOM, // DOM driver source
  globalEvents, // globalEvent driver sources
  props$ = O.empty(), // currently not properties supported
  data$ = O.just({ // The graph data to display
    nodes: [ // the graph's nodes
      {
        label: "The only node", // The node's name
        x: 23, // The node's x position
        y: 42, // The node's y position
      },
    ],
    edges: [ // the graphs edges
      {
        label: "A Reflexive Edge", // The edge's label
        from: 0, // The index of the source node
        to: 0, // The index of the target node
      },
    ],
  }),
}) => {
  const graph$ = data$.map(graphFromJson);
  const {isolateSource, isolateSink} = DOM;
  const actions = intent(isolateSource(DOM, 'graphicsContent'), globalEvents);
  const state$ = model(props$, graph$, actions);
  const vtree$ = view(state$);

  const stage = isolate(graphics, 'mygraphics')({
    DOM,
    globalEvents,
    props$: O.just({
      width: 600,
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
    ]).share(),
    stopPropagation: actions.stopPropagation,
  };
};
