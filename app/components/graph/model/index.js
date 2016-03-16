import {Observable as O} from 'rx';
import I from 'immutable';

import {graphFromJson, graphNode} from '../lib/graph';
import {layoutGraph} from '../lib/layout';

const _position = I.Record({
  x: 0,
  y: 0,
});

const graphUiState = I.Record({
  graph: null,
  nodeRadius: 10,
  transientNode: null,
}, 'graphUiState');

const applyModifier = (state, fn) => fn(state);

const tryCreate = (pos, state) =>
  state.set('transientNode', _position(pos))
;

const doCreate = (state) =>
  state.updateIn(['graph', 'nodes'], (nodes) =>
    nodes.push(graphNode({
      label: "new",
      x: state.transientNode.x,
      y: state.transientNode.y,
    })))
;

const stopCreate = (state) =>
  state.set('transientNode', null)
;

export default (props$, data$, actions) => {
  return data$
  .map(graphFromJson)
  .map((baseGraph) =>
    O.merge([
      actions.tryCreate$.map((pos) => (state) => tryCreate(pos, state)),
      actions.doCreate$.map(() => (state) => doCreate(state)),
      actions.stopCreate$.map(() => (state) => stopCreate(state)),
    ])
    .startWith(graphUiState({graph: baseGraph}))
    .scan(applyModifier)
    .combineLatest(props$, (state, props) =>
      state
        .update('graph', (graph) =>
          layoutGraph(props.nodeRadius, graph)
        )
        .set('nodeRadius', props.nodeRadius)
    )
  ).switch()
  .shareReplay(1);
};
