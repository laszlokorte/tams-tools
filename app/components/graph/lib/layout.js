import I from 'immutable';

import bounds from '../../graphics/lib/bounds';

import {clamp} from '../../../lib/utils';

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

  const n = nodes.size === 0 ?
    [{x: 0, y: 0}] : nodes;

  return bounds(n.reduce((box, node) => ({
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

export const calculateConnectionPath = ({
  from,
  to,
  radius,
  preferredAngle = Math.PI,
  streight = false,
}) => {
  const deltaX = to.x - from.x;
  const deltaY = to.y - from.y;

  const deltaXHalf = deltaX / 2;
  const deltaYHalf = deltaY / 2;

  const distance = Math.sqrt(
    deltaX * deltaX + deltaY * deltaY
  );

  const arcOffset = 18 * radius / Math.pow(
    clamp(distance - 1.5 * radius, radius, 4 * radius),
    0.509
  );
  const arcSpread = Math.max(distance / 5, arcOffset);

  const deltaXNorm = distance > 0 ?
    deltaX / distance : Math.cos(preferredAngle + Math.PI / 2);
  const deltaYNorm = distance > 0 ?
    deltaY / distance : Math.sin(preferredAngle + Math.PI / 2);

  const orthoXNorm = deltaYNorm;
  const orthoYNorm = -deltaXNorm;

  const midX = from.x + deltaXHalf;
  const midY = from.y + deltaYHalf;

  const midXOffset = midX + orthoXNorm * arcOffset;
  const midYOffset = midY + orthoYNorm * arcOffset;

  const midXSpreadA = midXOffset - deltaXNorm * arcSpread;
  const midYSpreadA = midYOffset - deltaYNorm * arcSpread;

  const midXSpreadB = midXOffset + deltaXNorm * arcSpread;
  const midYSpreadB = midYOffset + deltaYNorm * arcSpread;

  const spreadADeltaX = midXSpreadA - from.x;
  const spreadADeltaY = midYSpreadA - from.y;

  const spreadBDeltaX = midXSpreadB - to.x;
  const spreadBDeltaY = midYSpreadB - to.y;

  const spreadADistance = Math.sqrt(
    spreadBDeltaX * spreadBDeltaX +
    spreadBDeltaY * spreadBDeltaY
  );

  const spreadBDistance = Math.sqrt(
    spreadADeltaX * spreadADeltaX +
    spreadADeltaY * spreadADeltaY
  );

  const fromX = from.x + radius *
    spreadADeltaX / spreadADistance;
  const fromY = from.y + radius *
    spreadADeltaY / spreadADistance;

  const toX = streight ? to.x : to.x +
    radius * 1.2 * spreadBDeltaX / spreadBDistance;
  const toY = streight ? to.y : to.y +
    radius * 1.2 * spreadBDeltaY / spreadBDistance;

  return path({
    fromX,
    fromY,
    c1X: midXSpreadA,
    c1Y: midYSpreadA,
    c2X: midXSpreadB,
    c2Y: midYSpreadB,
    toX,
    toY,
  });
};

const calculateEdgeLayout = (nodeRadius, edges, layoutedNodes) => {
  return edges.map((e) => {
    const startNode = layoutedNodes.get(e.fromIndex);
    const endNode = layoutedNodes.get(e.toIndex);
    return e.set('path', calculateConnectionPath({
      from: startNode,
      to: endNode,
      radius: nodeRadius,
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
