import I from 'immutable';
import layoutBuchheim from './buchheim';

const graphNode = I.Record({
  label: null,
  x: 0,
  y: 0,
  leaf: false,
  labelAnchor: 'middle',
  xOffset: 0,
});

const graphEdge = I.Record({
  label: null,
  fromX: 0,
  fromY: 0,
  toX: 0,
  toY: 0,
});

const nodeList = (layoutNode, acc = I.List(), rel = 'middle') => {
  if (layoutNode === null) {
    return acc;
  }

  let labelAnchor = rel;
  let xOffset = 0;

  if (rel === 'start') {
    xOffset = 5;
  } else if (rel === 'end') {
    xOffset = -5;
  }

  const mid = (layoutNode.children.length - 1) / 2;

  return layoutNode.children.reduce((prev, c, i) => {
    let newRel;
    if (i < mid) {
      newRel = 'end';
    } else if (i > mid) {
      newRel = 'start';
    } else {
      newRel = rel;
    }
    return nodeList(c, prev, newRel);
  }, acc.push(graphNode({
    label: layoutNode.node.name,
    x: layoutNode.x,
    y: layoutNode.y,
    leaf: layoutNode.children.length === 0,
    labelAnchor: labelAnchor,
    xOffset: xOffset,
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
