import I from 'immutable';

// object representing a node of the tree graph
const graphNode = I.Record({
  label: null, // name of the node
  x: 0, // 2d cartesian x position of the node
  y: 0, // 2d cartesian y position of the node
  leaf: false, // if it is a leaf node
  // text alignment of the node's label
  // (start | middle | end)
  labelAlignment: 'middle',
  xOffset: 0, // horizontal offset of the node's label
  color: null, // color of the node (css color)
  faded: false, // if the node should be slightly faded out
}, 'treeNode');

// object representing an edge of the tree graph
const graphEdge = I.Record({
  fromX: 0, // 2d position of the edge
  fromY: 0,
  toX: 0,
  toY: 0,
  color: null, // color of the edge (css color)
  faded: false, // if the edge should be slightly faded out
}, 'treeEdge');

// object representing a tree graph
// it contains lists of nodes and edges to represent the
// tree as a flat structure instead of an object tree
export const graph = I.Record({
  nodes: I.List(),
  edges: I.List(),
}, 'tree');

// get a list of a child nodes of the given node
// the list also includes the given node itself
const nodeList = (layoutNode, acc = I.List(), rel = 'middle') => {
  if (layoutNode === null) {
    return acc;
  }

  let labelAlignment = rel;
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
    labelAlignment: labelAlignment,
    xOffset: xOffset,
    color: layoutNode.node.color,
    faded: layoutNode.node.hidden,
  })));
};

// get all edges of the child nodes of the given node
// as well as the edges of the node itself
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
    color: layoutNode.node.color,
    faded: layoutNode.parent.node.hidden,
  })) : acc);
};

// check if the given graph is empty
export const isGraphEmpty = (g) => {
  return g.nodes.isEmpty() &&
    g.edges.isEmpty();
};

// create a tree graph from a given plain object
export const graphFromJson = (object) => {
  return graph({
    nodes: nodeList(object),
    edges: edgeList(object),
  });
};
