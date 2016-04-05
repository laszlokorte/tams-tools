import {Observable as O} from 'rx';
import I from 'immutable';

import {graphFromJson, graphNode} from '../lib/graph';
import {layoutGraph} from '../lib/layout';

const _position = I.Record({
  x: 0,
  y: 0,
});

const _selection = I.Record({
  type: null,
  value: -1,
});

const graphUiState = I.Record({
  mode: 'view',
  graph: null,
  nodeRadius: 10,
  transientNode: null,
  selection: null,
}, 'graphUiState');

const applyModifier = (state, fn) => fn(state);

const tryCreateNode = (pos, state) =>
  state.set('transientNode', _position(pos))
;

const doCreateNode = (state) =>
  state.updateIn(['graph', 'nodes'], (nodes) =>
    nodes.push(graphNode({
      label: "new",
      x: state.transientNode.x,
      y: state.transientNode.y,
    })))
;
const stopCreateNode = (state) =>
  state.set('transientNode', null)
;

const tryMoveNode = (nodeIndex, pos, state) =>
  state
  .updateIn(['graph', 'nodes', nodeIndex], (node) =>
    node.set('x', pos.x).set('y', pos.y)
  )
;

const doMoveNode = (nodeIndex, pos, state) =>
  state
;

const stopMoveNode = (state) =>
  state.set('transientNode', null)
;

const selectNode = (value, state) =>
  state.set('selection', _selection({
    type: 'node',
    value,
  }))
;

const selectEdge = (value, state) =>
  state.set('selection', _selection({
    type: 'edge',
    value,
  }))
;

const deselect = (state) =>
  state.set('selection', null)
;

const switchMode = (mode, state) =>
  state.set('mode', mode)
;

export default (props$, data$, enabled$, actions) => {
  return O.combineLatest(
    data$.map(graphFromJson),
    enabled$,
    actions.switchMode$.startWith('view'),
    (baseGraph, enabled, mode) =>
    O.merge([
      actions.tryCreateNode$.map((pos) => (state) => tryCreateNode(pos, state)),
      actions.doCreateNode$.map(() => (state) =>
        selectNode(state.graph.nodes.size, doCreateNode(state))
      ),
      actions.stopCreateNode$.map(() => (state) => stopCreateNode(state)),

      actions.tryMoveNode$.map((move) =>
        (state) => tryMoveNode(move.nodeIndex, move,
          selectNode(move.nodeIndex, state)
        )
      ),
      actions.doMoveNode$.map((move) =>
        (state) => doMoveNode(move.nodeIndex, move,
          selectNode(move.nodeIndex, state)
        )
      ),
      actions.stopMoveNode$.map(() => (state) => stopMoveNode(state)),

      actions.selectNode$.map((index) => (state) => selectNode(index, state)),
      actions.selectEdge$.map((index) => (state) => selectEdge(index, state)),

      actions.deselect$.map(() => (state) => deselect(state)),
    ])
    .startWith(graphUiState({graph: baseGraph}))
    .scan(applyModifier)
    .combineLatest(props$, (state, props) =>
      state
        .set('mode', enabled ? mode : 'disabled')
        .update('graph', (graph) =>
          layoutGraph(props.nodeRadius, graph, state.transientNode)
        )
        .set('nodeRadius', props.nodeRadius)
    )
  ).switch()
  .shareReplay(1);
};
