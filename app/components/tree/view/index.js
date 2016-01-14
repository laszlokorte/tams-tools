import {svg} from '@cycle/dom';

import './index.styl';

const render = ({data}) =>
  svg('g',[
    data.edges.map((edge) =>
      svg('line', {
        x1: edge.fromX * data.scaleX,
        y1: edge.fromY * data.scaleY,
        x2: edge.toX * data.scaleX,
        y2: edge.toY * data.scaleY,
        stroke: 'black',
        'stroke-width': '2px',
        class: 'tree-edge',
      })
    ).toArray(),
    data.nodes.map((node) => [
      svg('circle', {
        cx: node.x * data.scaleX,
        cy: node.y * data.scaleY,
        r: 5,
        class: 'tree-node',
      }),
      svg('text', {
        x: node.x * data.scaleX + (node.leaf ? 0 : node.xOffset),
        y: node.y * data.scaleY + (node.leaf ? 16 : -10),
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
