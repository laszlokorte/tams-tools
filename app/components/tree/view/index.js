import {svg} from '@cycle/dom';

import {attrBool} from '../../../lib/h-helper';

import './index.styl';

const render = (state) =>
  svg('g', [
    state.graph.edges.map((edge) =>
      svg('line', {
        x1: edge.fromX * state.scaleX,
        y1: edge.fromY * state.scaleY,
        x2: edge.toX * state.scaleX,
        y2: edge.toY * state.scaleY,
        'stroke-width': '2px',
        class: 'tree-edge' + (edge.faded ? ' tree-faded' : ''),
        stroke: 'black',
        style: {
          stroke: attrBool(edge.color),
        },
      })
    ).toArray(),
    state.graph.nodes.map((node) => [
      svg('circle', {
        cx: node.x * state.scaleX,
        cy: node.y * state.scaleY,
        r: 5,
        class: 'tree-node' + (node.faded ? ' tree-faded' : ''),
        fill: 'black',
        style: {
          fill: attrBool(node.color),
        },
      }),
      svg('text', {
        x: node.x * state.scaleX + (node.leaf ? 0 : node.xOffset),
        y: node.y * state.scaleY + (node.leaf ? 16 : -10),
        'text-anchor': node.leaf ? 'middle' : node.labelAnchor,
        'alignment-baseline': 'middle',
        class: 'tree-node-label' + (node.faded ? ' tree-faded' : ''),
        style: {
          fill: attrBool(node.color),
        },
      }, node.label),
    ]).toArray(),
  ])
;

export default (state$) =>
  state$.map(render)
;
