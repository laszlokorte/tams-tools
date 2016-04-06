import {Observable as O} from 'rx';
import I from 'immutable';

import {graphFromJson, graphNode, graphEdge} from '../lib/graph';
import {layoutGraph, calculateConnectionPath} from '../lib/layout';

const _position = I.Record({
  x: 0,
  y: 0,
});

const _partialEdge = I.Record({
  fromIndex: null,
  toIndex: null,
  toPosition: null,
  path: null,
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
  transientEdge: null,
  selection: null,
}, 'graphUiState');

const applyModifier = (state, fn) => fn(state);

const initGraph = (graph, state) =>
  state
    .set('graph', graph)
    .set('transientNode', null)
    .set('transientEdge', null)
;

const tryCreateNode = (pos, state) =>
  state.set('transientNode', _position(pos))
;

const doCreateNode = (state) =>
  state.transientNode === null ? state :
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

const tryConnectNodes = ({fromIndex, toIndex, x, y}, state) =>
  state.set('transientEdge', _partialEdge({
    fromIndex,
    toIndex,
    toPosition: _position({
      x,
      y,
    }),
  }))
;

const doConnectNodes = (state) =>
  state.transientEdge === null ||
  state.transientEdge.toIndex === null ? state :

  state.updateIn(['graph', 'edges'], (edges) =>
    edges.add(graphEdge({
      label: "Foo",
      fromIndex: state.transientEdge.fromIndex,
      toIndex: state.transientEdge.toIndex,
    }))
  )
;

const stopConnectNodes = (state) =>
  state.set('transientEdge', null)
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

const layoutTransientEdge = (state, edge, radius) => {
  const invalid =
    edge.toIndex === edge.fromIndex ||
    edge.toIndex === null;
  const fromNode = state.nodes.get(edge.fromIndex);
  const toNode = invalid ?
    edge.toPosition :
    state.nodes.get(edge.toIndex);
  const preferredAngle = fromNode.pivotAngle;

  return calculateConnectionPath({
    from: fromNode,
    to: toNode,
    offset: radius,
    preferredAngle,
    streight: invalid,
  });
};

export default (props$, data$, enabled$, actions) => {
  return O.combineLatest(
    enabled$,
    actions.switchMode$.startWith('view'),
    (enabled, mode) =>
    O.merge([
      data$.map(graphFromJson).map((graph) => (state) =>
        initGraph(graph, state)
      ),
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

      actions.tryConnectNodes$.map((connection) => (state) =>
        tryConnectNodes(connection, state)
      ),
      actions.doConnectNodes$.map(() => (state) =>
        doConnectNodes(state)
      ),
      actions.stopConnectNodes$.map(() => (state) => stopConnectNodes(state)),

      actions.selectNode$.map((index) => (state) => selectNode(index, state)),
      actions.selectEdge$.map((index) => (state) => selectEdge(index, state)),

      actions.deselect$.map(() => (state) => deselect(state)),
    ])
    .startWith(graphUiState({graph: graphFromJson({})}))
    .scan(applyModifier)
    .combineLatest(props$, (state, props) =>
      state
        .set('mode', enabled ? mode : 'disabled')
        .update('graph', (graph) =>
          layoutGraph(props.nodeRadius, graph, state.transientNode)
        )
        .update('transientEdge', (e) =>
          e && e.set('path', layoutTransientEdge(
            state.graph, e, props.nodeRadius
          ))
        )
        .set('nodeRadius', props.nodeRadius)
    )
  ).switch()
  .shareReplay(1);
};

export const isNodeSelected = (nodeIndex, state) =>
  state.selection !== null &&
  state.selection.type === 'node' &&
  state.selection.value === nodeIndex
;

export const isEdgeSelected = (edge, state) =>
  state.selection !== null &&
  state.selection.type === 'edge' &&
  state.selection.value.fromIndex === edge.fromIndex &&
  state.selection.value.toIndex === edge.toIndex
;
