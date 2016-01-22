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
    minX: Infinity,
    maxX: -Infinity,
    minY: Infinity,
    maxY: -Infinity,
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
