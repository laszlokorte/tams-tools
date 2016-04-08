import I from 'immutable';

export const graphNode = I.Record({
  label: null,
  x: 0,
  y: 0,
  pivotAngle: null,
}, 'graphNode');

export const graphEdge = I.Record({
  label: null,
  fromIndex: null,
  toIndex: null,
  path: null,
}, 'graphEdge');

export const _graph = I.Record({
  nodes: I.List(),
  edges: I.Set(),
  bounds: null,
}, 'graph');

export const graphFromJson = (data) => {
  return _graph({
    nodes: I.List(data.nodes).map((n) => graphNode({
      label: n.label,
      x: n.x,
      y: n.y,
    })),
    edges: I.Set(data.edges).map((e) => graphEdge({
      label: e.label,
      fromIndex: e.from,
      toIndex: e.to,
    })),
  });
};

export const removeNode = (nodeIndex, graph) =>
  graph
    .removeIn(['nodes', nodeIndex])
    .update('edges', (edges) =>
      edges.filter((e) =>
        e.fromIndex !== nodeIndex &&
        e.toIndex !== nodeIndex
      ).map((e) =>
        e
          .update('fromIndex', (old) => old < nodeIndex ? old : old - 1)
          .update('toIndex', (old) => old < nodeIndex ? old : old - 1)
      )
    )
;

export const removeEdge = (fromIndex, toIndex, graph) =>
  graph.update('edges', (edges) =>
    edges.filter((edge) =>
      edge.fromIndex !== fromIndex ||
      edge.toIndex !== toIndex
    )
  )
;
