import I from 'immutable';

import bounds from '../../graphics/lib/bounds';

export const layoutedNode = I.Record({
  label: null,
  x: 0,
  y: 0,
  radius: 20,
}, 'layoutedNode');

const path = I.Record({
  fromX: 0,
  fromY: 0,
  c1X: 0,
  c1Y: 0,
  c2X: 0,
  c2Y: 0,
  toX: 0,
  toY: 0,
}, 'path');

export const layoutedEdge = I.Record({
  label: null,
  path: path(),
  head: true,
}, 'layoutedEdge');

export const layoutedGraph = I.Record({
  nodes: I.List(),
  edges: I.List(),
}, 'layoutedGraph');

const boundingBox = (nodes) => {
  return bounds(nodes.reduce((box, node) => ({
    minX: Math.min(box.minX, node.x - node.radius),
    maxX: Math.max(box.maxX, node.x + node.radius),
    minY: Math.min(box.minY, node.y - node.radius),
    maxY: Math.max(box.maxY, node.y + node.radius),
  }), {
    minX: Infinity,
    maxX: -Infinity,
    minY: Infinity,
    maxY: -Infinity,
  }));
};

const calculateNodeLayout = (graph) => {
  return graph.nodes.map((n) =>
    layoutedNode(n)
  );
};

const calculateEdgeLayout = (graph, layoutedNodes) => {
  return graph.edges.map((e) => {
    const startNode = layoutedNodes.get(e.fromIndex);
    const endNode = layoutedNodes.get(e.toIndex);
    return layoutedEdge({
      label: e.label,
      path: path({
        fromX: startNode.x,
        fromY: startNode.y,
        c1X: 0,
        c1Y: 0,
        c2X: 0,
        c2Y: 0,
        toX: endNode.x,
        toY: endNode.y,
      }),
    });
  }
  );
};

const calculateLayout = (graph) => {
  const nodes = calculateNodeLayout(graph);
  const edges = calculateEdgeLayout(graph, nodes);

  return layoutedGraph({
    nodes,
    edges,
  });
};

export const layoutGraph = (graph) => {
  const layouted = calculateLayout(graph);

  return {
    graph: layouted,
    bounds: boundingBox(graph.nodes),
  };
};
