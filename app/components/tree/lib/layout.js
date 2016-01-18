import layoutBuchheim from './buchheim';
import {graphFromJson} from './graph';
import bounds from '../../graphics/lib/bounds';

const boundingBox = (nodes) => {
  return bounds(nodes.reduce((box, node) => ({
    minX: Math.min(box.minX, node.x),
    maxX: Math.max(box.maxX, node.x),
    minY: Math.min(box.minY, node.y),
    maxY: Math.max(box.maxY, node.y),
  }), {
    minX: 0,
    maxX: 0,
    minY: 0,
    maxY: 0,
  }));
};

export const layoutTree = (data) => {
  const tree = data ? layoutBuchheim(data) : null;
  const graph = graphFromJson(tree);

  return {
    graph: graph,
    bounds: boundingBox(graph.nodes),
  };
};

export {bounds};
