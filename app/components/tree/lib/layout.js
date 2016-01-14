import I from 'immutable';
import layoutBuchheim from './buchheim';

const graphNode = I.Record({
  label: null,
  x: 0,
  y: 0,
});

const graphEdge = I.Record({
  label: null,
  fromX: 0,
  fromY: 0,
  toX: 0,
  toY: 0,
});

const nodeList = (layoutNode, acc = I.List()) => {
  return layoutNode.children.reduce(
    (prev, c) => nodeList(c, prev)
  , acc.push(graphNode({
    label: layoutNode.node.name,
    x: layoutNode.x,
    y: layoutNode.y,
  })));
};

const edgeList = (layoutNode, acc = I.List()) => {
  return layoutNode.children.reduce(
    (prev, c) => edgeList(c, prev)
  , layoutNode.parent ? acc.push(graphEdge({
    fromX: layoutNode.parent.x,
    fromY: layoutNode.parent.y,
    toX: layoutNode.x,
    toY: layoutNode.y,
  })) : acc);
};

export default (data) => {
  const tree = layoutBuchheim(data);

  const nodes = nodeList(tree);
  const edges = edgeList(tree);

  return {
    nodes: nodes,
    edges: edges,
    bounds: {
      minX: -40,
      maxX: 40,
      minY: -40,
      maxY: 40,
    },
  };
};
