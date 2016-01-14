import {svg} from '@cycle/dom';

import './index.styl';

const render = ({data}) =>
  svg('g',[
    data.nodes.map((node) => [
      svg('circle', {
        cx: node.x * 50,
        cy: node.y * 70,
        r: 10,
      }),
      svg('text', {
        x: node.x * 50,
        y: node.y * 70 - 20,
        'text-anchor': 'middle',
        'alignment-baseline': 'middle',
      }, node.label),
    ]).toArray(),
    data.edges.map((edge) =>
      svg('line', {
        x1: edge.fromX * 50,
        y1: edge.fromY * 70,
        x2: edge.toX * 50,
        y2: edge.toY * 70,
        stroke: 'black',
        'stroke-width': '2px'
      })
    ).toArray(),
  ])
;

export default (state$) =>
  state$.map(render)
;
