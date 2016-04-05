import I from 'immutable';

import bounds from '../../graphics/lib/bounds';

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

const calculateEdgePivotAngle = (nodes, edges, nodeIndex) => {
  const state = nodes.get(nodeIndex);
  const outgoingTrans = edges.filter((edge) => {
    return edge.fromIndex === nodeIndex &&
      edge.toIndex !== nodeIndex;
  }).map((edge) => nodes.get(edge.toIndex));

  const incomingTrans = edges.filter((edge) => {
    return edge.fromIndex !== nodeIndex &&
      edge.toIndex === nodeIndex;
  }).map((edge) => nodes.get(edge.fromIndex));

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

const boundingBox = (nodes, radius, padding, extraNode) => {
  const initial = extraNode ? {
    minX: extraNode.x - padding,
    maxX: extraNode.x + padding,
    minY: extraNode.y - padding,
    maxY: extraNode.y + padding,
  } : {
    minX: Infinity,
    maxX: -Infinity,
    minY: Infinity,
    maxY: -Infinity,
  };

  return bounds(nodes.reduce((box, node) => ({
    minX: Math.min(box.minX, node.x - padding),
    maxX: Math.max(box.maxX, node.x + padding),
    minY: Math.min(box.minY, node.y - padding),
    maxY: Math.max(box.maxY, node.y + padding),
  }), initial));
};

const calculateNodeLayout = (nodes, edges) => {
  return nodes.map((node, nodeIndex) => {
    return node.set(
      'pivotAngle',
      calculateEdgePivotAngle(nodes, edges, nodeIndex)
    );
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

const calculateEdgeLayout = (nodeRadius, edges, layoutedNodes) => {
  return edges.map((e) => {
    const startNode = layoutedNodes.get(e.fromIndex);
    const endNode = layoutedNodes.get(e.toIndex);
    return e.set('path', calculateConnectionPath({
      from: startNode,
      to: endNode,
      offset: nodeRadius,
      preferredAngle: startNode.pivotAngle + Math.PI,
      streight: false,
    }));
  });
};

const calculateLayout = (nodeRadius, graph) => {
  const layoutedNodes = calculateNodeLayout(graph.nodes, graph.edges);
  return graph
    .set('nodes', layoutedNodes)
    .update('edges', (edges) =>
      calculateEdgeLayout(70, edges, layoutedNodes)
    );
};

export const layoutGraph = (nodeRadius, graph, extraNode) => {
  const layouted = calculateLayout(nodeRadius, graph);

  return layouted.set(
    'bounds',
    boundingBox(layouted.nodes, nodeRadius, 10 * nodeRadius, extraNode)
  );
};
