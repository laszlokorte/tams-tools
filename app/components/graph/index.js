import {Observable as O} from 'rx';
import isolate from '@cycle/isolate';
import {wrapInDiv} from '../../lib/dom-helper';

import graphics from '../graphics';

import model from './model';
import view from './view';
import intent from './intent';
import commands from './model/commands';

import modePanel from './view/mode-panel';

// initialize the graph component
export default ({
  DOM, // DOM driver source
  globalEvents, // globalEvent driver sources
  props$ = O.just({
    nodeRadius: 70, // radius of the node circles
  }),
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
  enabled$ = O.just(true),
  resetSelection$ = O.empty(),
}) => {
  const {isolateSource, isolateSink} = DOM;
  const actions = intent(
    DOM, isolateSource(DOM, 'graphicsContent'),
    globalEvents, resetSelection$
  );
  const state$ = model(props$, data$, enabled$, actions);
  const vtree$ = view(state$);

  const stage = isolate(graphics, 'mygraphics')({
    DOM,
    globalEvents,
    props$: O.just({
      width: 600,
      height: 600,
    }),
    camera$: O.just({x: 0, y: 0, zoom: 1}),
    bounds$: state$.map((s) => s.graph.bounds).share(),
    content$: isolateSink(vtree$, 'graphicsContent').share(),
    autoCenter$: O.merge([
      state$.take(1),
      actions.autoLayout$,
    ]).map(() => true),
  });

  return {
    DOM: O.combineLatest(
      state$.map(modePanel),
      stage.DOM,
      (a,b) => [a,b]
    ).map(wrapInDiv),
    preventDefault: O.merge([
      actions.preventDefault,
      stage.preventDefault,
    ]).share(),
    stopPropagation: actions.stopPropagation,
    action$: commands(actions, state$).delay(0),
    selection$: state$
      .map((state) => state.selection)
      .distinctUntilChanged(
        (s) => s && s.value
      )
      .share()
      .delay(0),
  };
};
