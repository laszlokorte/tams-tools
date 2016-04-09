import {Observable as O} from 'rx';
import I from 'immutable';

import {
  graphFromJson, graphNode, graphEdge,
  removeEdge as removeEdgeFromGraph,
  removeNode as removeNodeFromGraph,
} from '../lib/graph';
import {layoutGraph, calculateConnectionPath} from '../lib/layout';

const _position = I.Record({
  x: 0,
  y: 0,
});

const _movingNode = I.Record({
  x: 0,
  y: 0,
  index: null,
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
  movingNode: null,
  selection: null,
}, 'graphUiState');

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

const applyModifier = (state, fn) => fn(state);

const initGraph = (graph, state) =>
  state
    .set('graph', graph)
    .update('selection', (selection) => {
      return selection;
      if (state.transientNode !== null) {
        return _selection({
          type: 'node',
          value: 0,
        });
      } else if (
        state.transientEdge !== null &&
        state.transientEdge.toIndex !== null
        ) {
        return _selection({
          type: 'edge',
          value: state.transientEdge,
        });
      } else {
        return selection;
      }
    })
;

const tryCreateNode = (pos, state) =>
  state.set('transientNode', _position(pos))
;

const doCreateNode = (state) =>
  state.transientNode === null ? state :
  state.updateIn(['graph', 'nodes'], (nodes) =>
    nodes.push(graphNode({
      label: "?",
      x: state.transientNode.x,
      y: state.transientNode.y,
    })))
;
const stopCreateNode = (state) =>
  state.set('transientNode', null)
;

const tryMoveNode = (nodeIndex, pos, state) =>
  state
  .set('movingNode', _movingNode({
    index: nodeIndex,
    x: pos.x,
    y: pos.y,
  }))
;

const doMoveNode = (state) =>
  state.updateIn(
    ['graph', 'nodes', state.movingNode.index],
    (node) =>
      node.merge({
        x: state.movingNode.x,
        y: state.movingNode.y,
      })
  )
;

const stopMoveNode = (state) =>
  state.set('movingNode', null)
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

const removeNode = (nodeIndex, state) =>
  state
    .update('graph', (g) => removeNodeFromGraph(nodeIndex, g))
    .update('selection', (old) =>
      isNodeSelected(nodeIndex, state) ? null : old
    )
;

const removeEdge = ({fromIndex, toIndex}, state) =>
  state
    .update('graph', (g) => removeEdgeFromGraph(fromIndex, toIndex, g))
    .update('selection', (old) =>
      isEdgeSelected({fromIndex, toIndex}, state) ? null : old
    )
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
    radius,
    preferredAngle,
    streight: invalid,
  });
};

const autoLayout = (nodeRadius, state) => {
  const count = state.graph.nodes.size;

  const centerX = state.graph.nodes.reduce((a,n) => a + n.x, 0) / count;
  const centerY = state.graph.nodes.reduce((a,n) => a + n.y, 0) / count;

  const nodeIndices = Array.apply(Array, {length: count})
    .map(Number.call, Number);

  nodeIndices.sort((a,b) => {
    const posA = state.graph.nodes.get(a);
    const posB = state.graph.nodes.get(b);
    const angleA = Math.atan2(centerY - posA.y, centerX - posA.x);
    const angleB = Math.atan2(centerY - posB.y, centerX - posB.x);

    return Math.sign(
      angleB - angleA
    );
  });

  return state.updateIn(['graph', 'nodes'], (nodes) =>
    nodes.map((node, nodeIndex) => {
      const angle = (-Math.PI / 2 - Math.PI * 2 *
          nodeIndices.indexOf(nodeIndex)) / count;

      const circumference = nodeRadius * 4 * Math.max(7, count);
      const radius = circumference / 2 / Math.PI;

      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      return node.merge({x, y});
    }).toList()
  );
};

const applyPartialNodeMovement = (state) =>
  !state.movingNode ? state :
   state.updateIn(
    ['graph', 'nodes', state.movingNode.index],
    (node) =>
    node.merge({
      x: state.movingNode.x,
      y: state.movingNode.y,
    })
  )
;

export default (props$, data$, enabled$, actions) => {
  return O.merge([
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
    actions.doMoveNode$.map(() =>
      (state) => doMoveNode(state)
    ),
    actions.stopMoveNode$.map(() => (state) => stopMoveNode(state)),

    actions.tryConnectNodes$.map((connection) => (state) =>
      tryConnectNodes(connection, state)
    ),
    actions.doConnectNodes$.map(() => (state) =>
      state.transientEdge && state.transientEdge.toIndex !== null ?
      selectEdge(state.transientEdge, doConnectNodes(state)) :
      doConnectNodes(state)
    ),
    actions.stopConnectNodes$.map(() => (state) => stopConnectNodes(state)),

    actions.autoLayout$.withLatestFrom(props$, (_, {nodeRadius}) => (state) =>
      autoLayout(nodeRadius, state)
    ),

    actions.selectNode$.map((index) => (state) => selectNode(index, state)),
    actions.selectEdge$.map((index) => (state) => selectEdge(index, state)),

    O.merge([
      actions.deselect$ ,
      enabled$.filter((e) => e === false),
    ]).map(() => (state) => deselect(state)),

    actions.removeNode$.map((nodeIndex) => (state) =>
      removeNode(nodeIndex, state)
    ),
    actions.removeEdge$.map((edgeIndex) => (state) =>
      removeEdge(edgeIndex, state)
    ),

    actions.switchMode$.map((mode) => (state) => state.set('mode', mode)),
  ])
  .scan(applyModifier, graphUiState({graph: graphFromJson({})}))
  .map(applyPartialNodeMovement)
  .combineLatest(props$, enabled$, (state, props, enabled) =>
    state
      .set('mode', enabled ? state.mode : 'disabled')
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
  .shareReplay(1);
};
