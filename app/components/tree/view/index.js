import {svg} from '@cycle/dom';

import {attrBool} from '../../../lib/h-helper';

import './index.styl';

const renderEdge = (state, edge) =>
  svg('line', {
    x1: edge.fromX * state.scaleX,
    y1: edge.fromY * state.scaleY,
    x2: edge.toX * state.scaleX,
    y2: edge.toY * state.scaleY,
    'stroke-width': '3',
    class: 'tree-edge' + (edge.faded ? ' tree-faded' : ''),
    stroke: 'black',
    style: {
      stroke: attrBool(edge.color),
    },
  })
;

const renderLabel = ({x, y, anchor, faded, color}, text) => [
  svg('text', {
    x,
    y,
    'text-anchor': anchor,
    'alignment-baseline': 'middle',
    class: 'tree-node-label-outline',
  }, text),
  svg('text', {
    x,
    y,
    'text-anchor': anchor,
    'alignment-baseline': 'middle',
    class: 'tree-node-label' + (faded ? ' tree-faded' : ''),
    style: {
      fill: attrBool(color),
    },
  }, text),
];

const renderNode = (state, node) => [
  svg('circle', {
    cx: node.x * state.scaleX,
    cy: node.y * state.scaleY,
    r: 6,
    class: 'tree-node' + (node.faded ? ' tree-faded' : ''),
    fill: 'black',
    style: {
      fill: attrBool(node.color),
    },
  }),
  renderLabel({
    x: node.x * state.scaleX + (node.leaf ? 0 : node.xOffset),
    y: node.y * state.scaleY + (node.leaf ? 25 : -15),
    anchor: node.leaf ? 'middle' : node.labelAlignment,
    faded: node.faded,
    color: node.color,
  }, node.label),
];

const render = (state) =>
  svg('g', [
    state.graph.edges.map((edge) =>
      renderEdge(state, edge)
    ).toArray(),
    state.graph.nodes.map(
      (node) => renderNode(state, node)
    ).toArray(),
  ])
;

export default (state$) =>
  state$.map(render)
;
