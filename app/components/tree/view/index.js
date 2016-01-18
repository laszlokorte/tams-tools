import {svg} from '@cycle/dom';

import './index.styl';

const render = (state) =>
  svg('g',[
    state.graph.edges.map((edge) =>
      svg('line', {
        x1: edge.fromX * state.scaleX,
        y1: edge.fromY * state.scaleY,
        x2: edge.toX * state.scaleX,
        y2: edge.toY * state.scaleY,
        stroke: 'black',
        'stroke-width': '2px',
        class: 'tree-edge',
      })
    ).toArray(),
    state.graph.nodes.map((node) => [
      svg('circle', {
        cx: node.x * state.scaleX,
        cy: node.y * state.scaleY,
        r: 5,
        class: 'tree-node',
      }),
      svg('text', {
        x: node.x * state.scaleX + (node.leaf ? 0 : node.xOffset),
        y: node.y * state.scaleY + (node.leaf ? 16 : -10),
        'text-anchor': node.leaf ? 'middle' : node.labelAnchor,
        'alignment-baseline': 'middle',
        class: 'tree-node-label',
      }, node.label),
    ]).toArray(),
  ])
;

export default (state$) =>
  state$.map(render)
;
