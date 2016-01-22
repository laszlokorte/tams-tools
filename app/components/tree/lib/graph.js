import I from 'immutable';

export const graphNode = I.Record({
  label: null,
  x: 0,
  y: 0,
  leaf: false,
  labelAnchor: 'middle',
  xOffset: 0,
  color: null,
}, 'graphNode');

export const graphEdge = I.Record({
  label: null,
  fromX: 0,
  fromY: 0,
  toX: 0,
  toY: 0,
  color: null,
}, 'graphEdge');

export const _graph = I.Record({
  nodes: I.List(),
  edges: I.List(),
}, 'graph');

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
  }, layoutNode.node.hidden ? acc : acc.push(graphNode({
    label: layoutNode.node.name,
    x: layoutNode.x,
    y: layoutNode.y,
    leaf: layoutNode.children.length === 0,
    labelAnchor: labelAnchor,
    xOffset: xOffset,
    color: layoutNode.node.color,
  })));
};

const edgeList = (layoutNode, acc = I.List()) => {
  if (layoutNode === null) {
    return acc;
  }
  return layoutNode.children.reduce(
    (prev, c) => edgeList(c, prev)
  , layoutNode.parent && !layoutNode.parent.node.hidden ? acc.push(graphEdge({
    fromX: layoutNode.parent.x,
    fromY: layoutNode.parent.y,
    toX: layoutNode.x,
    toY: layoutNode.y,
    color: layoutNode.node.color,
  })) : acc);
};

export const isGraphEmpty = (graph) => {
  return graph.nodes.isEmpty() &&
    graph.edges.isEmpty();
};

export const graphFromJson = (object) => {
  return _graph({
    nodes: nodeList(object),
    edges: edgeList(object),
  });
};

export {_graph as graph};
