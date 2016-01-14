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
      })
    ).toArray(),
    data.nodes.map((node) => [
      svg('circle', {
        cx: node.x * data.scaleX,
        cy: node.y * data.scaleY,
        r: 5,
      }),
      svg('text', {
        x: node.x * data.scaleX,
        y: node.y * data.scaleY + (node.leaf ? 16 : -16),
        'text-anchor': 'middle',
        'alignment-baseline': 'middle',
      }, node.label),
    ]).toArray(),
  ])
;

export default (state$) =>
  state$.map(render)
;
