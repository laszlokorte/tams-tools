import I from 'immutable';
import layoutBuchheim from './buchheim';

const graphNode = I.Record({
  label: null,
  x: 0,
  y: 0,
  leaf: false,
});

const graphEdge = I.Record({
  label: null,
  fromX: 0,
  fromY: 0,
  toX: 0,
  toY: 0,
});

const nodeList = (layoutNode, acc = I.List()) => {
  if (layoutNode === null) {
    return acc;
  }
  return layoutNode.children.reduce(
    (prev, c) => nodeList(c, prev)
  , acc.push(graphNode({
    label: layoutNode.node.name,
    x: layoutNode.x,
    y: layoutNode.y,
    leaf: layoutNode.children.length === 0,
  })));
};

const edgeList = (layoutNode, acc = I.List()) => {
  if (layoutNode === null) {
    return acc;
  }
  return layoutNode.children.reduce(
    (prev, c) => edgeList(c, prev)
  , layoutNode.parent ? acc.push(graphEdge({
    fromX: layoutNode.parent.x,
    fromY: layoutNode.parent.y,
    toX: layoutNode.x,
    toY: layoutNode.y,
  })) : acc);
};

const boundingBox = (nodes) => {
  return nodes.reduce((box, node) => ({
    minX: Math.min(box.minX, node.x),
    maxX: Math.max(box.maxX, node.x),
    minY: Math.min(box.minY, node.y),
    maxY: Math.max(box.maxY, node.y),
  }), {
    minX: 0,
    maxX: 0,
    minY: 0,
    maxY: 0,
  });
};

export default (data) => {
  const tree = data ? layoutBuchheim(data) : null;

  const nodes = nodeList(tree);
  const edges = edgeList(tree);

  return {
    nodes: nodes,
    edges: edges,
    bounds: boundingBox(nodes),
  };
};
