import I from 'immutable';

import bounds from '../../graphics/lib/bounds';

export const layoutedNode = I.Record({
  label: null,
  x: 0,
  y: 0,
  pivotAngle: 0,
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
  nodeRadius: 70,
}, 'layoutedGraph');

const calculateEdgePivotAngle = (graph, nodeIndex) => {
  const state = graph.nodes.get(nodeIndex);
  const outgoingTrans = graph.edges.filter((edge) => {
    return edge.fromIndex === nodeIndex &&
      edge.toIndex !== nodeIndex;
  }).map((edge) => graph.nodes.get(edge.toIndex));

  const incomingTrans = graph.edges.filter((edge) => {
    return edge.fromIndex !== nodeIndex &&
      edge.toIndex === nodeIndex;
  }).map((edge) => graph.nodes.get(edge.fromIndex));

  const avoidAngleOutgoing = outgoingTrans.map((target) => {
    return Math.atan2(target.y - state.y, target.x - state.x);
  }).reduce((prev, angle) => {
    return {
      cos: prev.cos + Math.cos(angle),
      sin: prev.sin + Math.sin(angle),
    };
  }, {cos: 0, sin: 0});

  const avoidAngleIncoming = incomingTrans.map((source) => {
    return Math.atan2(source.y - state.y, source.x - state.x);
  }).reduce((prev, angle) => {
    return {
      cos: prev.cos + Math.cos(angle),
      sin: prev.sin + Math.sin(angle),
    };
  }, {cos: 0, sin: 0});

  const angleSum = Math.atan2(
    avoidAngleOutgoing.sin + avoidAngleIncoming.sin,
    avoidAngleOutgoing.cos + avoidAngleIncoming.cos
  );

  return angleSum;
};

const boundingBox = (nodes, radius, padding) => {
  return bounds(nodes.reduce((box, node) => ({
    minX: Math.min(box.minX, node.x - padding),
    maxX: Math.max(box.maxX, node.x + padding),
    minY: Math.min(box.minY, node.y - padding),
    maxY: Math.max(box.maxY, node.y + padding),
  }), {
    minX: Infinity,
    maxX: -Infinity,
    minY: Infinity,
    maxY: -Infinity,
  }));
};

const calculateNodeLayout = (graph) => {
  return graph.nodes.map((node, nodeIndex) => {
    return layoutedNode({
      label: node.label,
      x: node.x,
      y: node.y,
      radius: graph.nodeRadius,
      pivotAngle: calculateEdgePivotAngle(graph, nodeIndex),
    });
  });
};

const calculateConnectionPath = ({
  from,
  to,
  offset,
  preferredAngle = Math.PI,
  streight = false,
}) => {
  let deltaX = to.x - from.x;
  let deltaY = to.y - from.y;
  let distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

  const rad = Math.atan2(deltaY, deltaX);
  const radExit = rad - 0.25;
  const radEnter = rad + 0.25;

  let offsetMultiplierEnter = 1;
  let offsetMultiplierExit = 1;
  const compact = distance < offset * 2 && !streight;

  if (compact) {
    offsetMultiplierEnter = 0.2;
    offsetMultiplierExit = 0.5;
  } else if (streight) {
    offsetMultiplierEnter = 0;
    offsetMultiplierExit = 0.2;
  } else if (distance - 40 < offset * 2) {
    offsetMultiplierEnter = 0.7;
    offsetMultiplierExit = 0.7;
  }

  const offsetExitX = Math.cos(radExit) * offset * offsetMultiplierExit;
  const offsetExitY = Math.sin(radExit) * offset * offsetMultiplierExit;
  const offsetEnterX = Math.cos(radEnter) *
    (offset + 20) * offsetMultiplierEnter;
  const offsetEnterY = Math.sin(radEnter) *
    (offset + 20) * offsetMultiplierEnter;

  const adjustedDeltaX = deltaX - offsetEnterX - offsetExitX;
  const adjustedDeltaY = deltaY - offsetEnterY - offsetExitY;

  const adjustedDistance = Math.sqrt(
    adjustedDeltaX * adjustedDeltaX +
    adjustedDeltaY * adjustedDeltaY
  );
  const bending = (Math.log(adjustedDistance) + 20) / adjustedDistance;

  const ctrlPointX = (adjustedDeltaX / 2 + adjustedDeltaY * bending);
  const ctrlPointY = (adjustedDeltaY / 2 - adjustedDeltaX * bending);

  const startX = from.x + offsetExitX;
  const startY = from.y + offsetExitY;
  const ctrlAX = ctrlPointX;
  const ctrlAY = ctrlPointY;
  const ctrlBX = ctrlPointX;
  const ctrlBY = ctrlPointY;
  const endX = adjustedDeltaX;
  const endY = adjustedDeltaY;

  if (compact) {
    let fromX = from.x;
    let fromY = from.y;
    const reflexive = Math.abs(distance) < 1;
    if (reflexive) {
      distance = offset;
      deltaX = -distance * Math.sin(preferredAngle);
      deltaY = distance * Math.cos(preferredAngle);
      fromX -= deltaX / 2;
      fromY -= deltaY / 2;
    }
    const rotatedDeltaX = deltaY / distance;
    const rotatedDeltaY = -deltaX / distance;
    const refOffsetX = rotatedDeltaX * offset;
    const refOffsetY = rotatedDeltaY * offset;

    const extraX = deltaX * offset / (distance || 1) / 2;
    const extraY = deltaY * offset / (distance || 1) / 2;

    return path({
      fromX: fromX + refOffsetX,
      fromY: fromY + refOffsetY,
      c1X: refOffsetX - extraX,
      c1Y: refOffsetY - extraY,
      c2X: refOffsetX + extraX + deltaX,
      c2Y: refOffsetY + extraY + deltaY,
      toX: deltaX + rotatedDeltaX * 10,
      toY: deltaY + rotatedDeltaY * 20,
    });
  } else {
    return path({
      fromX: startX,
      fromY: startY,
      c1X: ctrlAX,
      c1Y: ctrlAY,
      c2X: ctrlBX,
      c2Y: ctrlBY,
      toX: endX,
      toY: endY,
    });
  }
};

const calculateEdgeLayout = (graph, layoutedNodes) => {
  return graph.edges.map((e) => {
    const startNode = layoutedNodes.get(e.fromIndex);
    const endNode = layoutedNodes.get(e.toIndex);
    return layoutedEdge({
      label: e.label,
      path: calculateConnectionPath({
        from: startNode,
        to: endNode,
        offset: graph.nodeRadius,
        preferredAngle: startNode.pivotAngle + Math.PI,
        streight: false,
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
    nodeRadius: graph.nodeRadius,
  });
};

export const layoutGraph = (graph) => {
  const layouted = calculateLayout(graph);

  return {
    graph: layouted,
    bounds: boundingBox(graph.nodes, graph.nodeRadius, 10 * graph.nodeRadius),
  };
};
