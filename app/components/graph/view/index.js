import {svg} from '@cycle/dom';

import {isEdgeSelected, isNodeSelected} from '../model';
import {IF} from '../../../lib/h-helper';

import './index.styl';

const bezierString = (path) =>
  `M${path.fromX},${path.fromY} ` +
    `C${path.c1X},${path.c1Y} ` +
    `${path.c2X},${path.c2Y} ` +
    `${path.toX},${path.toY} `
;

const interpCubic = ({t, start, ctrl1, ctrl2, end}) => {
  const tInv = (1 - t);
  return tInv * tInv * tInv * start +
    3 * tInv * tInv * t * ctrl1 +
    3 * tInv * t * t * ctrl2 +
    t * t * t * end;
};

const pathLabel = (path, label, fontSize) => {
  const dx = path.toX - path.fromX;
  const dy = path.toY - path.fromY;
  const d = Math.sqrt(dx * dx + dy * dy);
  const orthoX = dy / d;
  const orthoY = -dx / d;

  const leftRight = orthoX > 0 ? 'start' : 'end';
  const anchor = Math.abs(orthoY / orthoX) > 3 ?
    'middle' : leftRight;

  const upDown = orthoY > 0 ? 'before-edge' : 'after-edge';
  const baseLine = Math.abs(orthoX / orthoY) > 3 ?
    'middle' : upDown;

  const x = interpCubic({
    t: 0.5, start: path.fromX,
    ctrl1: path.c1X, ctrl2: path.c2X,
    end: path.toX,
  }) + fontSize / 2 * orthoX;

  const y = interpCubic({
    t: 0.5, start: path.fromY,
    ctrl1: path.c1Y, ctrl2: path.c2Y,
    end: path.toY,
  }) + fontSize / 2 * orthoY;

  return [
    svg('text', {
      class: 'graph-edge-label-background',
      x,
      y,
      'text-anchor': anchor,
      'alignment-baseline': baseLine,
      'dominant-baseline': 'middle',
      fill: 'none',
      'font-size': fontSize,
      key: 'label-background',
    }, label),
    svg('text', {
      class: 'graph-edge-label',
      x,
      y,
      'text-anchor': anchor,
      'alignment-baseline': baseLine,
      'dominant-baseline': 'middle',
      fill: 'black',
      'font-size': fontSize,
      key: 'label',
    }, label),
  ];
};

const arrowHeadString = (path, length) => {
  const totalLength = Math.sqrt(
    path[6] * path[6] +
    path[7] * path[7]
  );

  const realLength = totalLength < length * 1.3 * 1.3 ?
  length / 1.3 : length;

  const cx = interpCubic({
    t: 0.9, start: path.fromX,
    ctrl1: path.c1X, ctrl2: path.c2X,
    end: path.toX,
  });
  const cy = interpCubic({
    t: 0.9, start: path.fromY,
    ctrl1: path.c1Y, ctrl2: path.c2Y,
    end: path.toY,
  });

  const angle = Math.atan2(path.toY - cy, path.toX - cx);
  const extend = Math.PI / 4;

  const angleA = angle + extend / 2;
  const angleB = angle - extend / 2;
  const tipX = path.toX + Math.cos(angle) * realLength / 2;
  const tipY = path.toY + Math.sin(angle) * realLength / 2;

  return [
    tipX,
    tipY,
    tipX - Math.cos(angleA) * realLength,
    tipY - Math.sin(angleA) * realLength,
    tipX - Math.cos(angleB) * realLength,
    tipY - Math.sin(angleB) * realLength,
  ].join(',');
};

const nodeAction = (state) => {
  if (state.mode === 'move') {
    return 'move';
  } else if (state.mode === 'connect') {
    return 'connect';
  } else if (state.mode === 'view') {
    return 'select';
  } else {
    return 'none';
  }
};

const edgeAction = (state) => {
  if (state.mode === 'connect' && state.transientEdge === null) {
    return 'select';
  } else if (state.mode === 'view') {
    return 'select';
  } else if (state.mode === 'move') {
    return 'select';
  } else {
    return 'none';
  }
};

const renderEdge = (state, edge, index, transient = false) => svg('g', {
  class: 'graph-edge' +
  (isEdgeSelected(edge, state) ? ' state-selected' : '') +
  (transient ? ' state-transient' : '') +
  (edge.toIndex !== null ? ' state-valid' : ' state-invalid'),
  attributes: transient ? void 0 : {
    'data-action': edgeAction(state),
    'data-edge': `${edge.fromIndex},${edge.toIndex}`,
  },
  key: `edge-${index}-${edge.fromIndex}-${transient ? '?' : edge.toIndex}`,
},[
  //debugBezier(edge.path),
  svg('polygon', {
    class: 'graph-edge-line-background',
    points: arrowHeadString(edge.path, 40),
    fill: 'none',
    key: 'background-head',
  }),
  svg('path', {
    class: 'graph-edge-line-background',
    d: bezierString(edge.path),
    stroke: 'none',
    'stroke-width': 100,
    fill: 'none',
    key: 'background-line',
  }),
  svg('polygon', {
    class: 'graph-edge-head',
    points: arrowHeadString(edge.path, 40),
    fill: 'black',
    key: 'head',
  }),
  svg('path', {
    class: 'graph-edge-line',
    d: bezierString(edge.path),
    stroke: 'black',
    'stroke-width': 5,
    fill: 'none',
    key: 'line',
  }),
  pathLabel(edge.path, edge.label, state.nodeRadius * 0.5),
])
;

const renderNode = (state, node, index) => svg('g', {
  class: 'graph-node' + (isNodeSelected(index, state) ?
    ' state-selected' : ''),
  attributes: {
    'data-node-index': index,
    'data-node-x': node.x,
    'data-node-y': node.y,
    'data-action': nodeAction(state),
  },
  key: `node-${index}`,
}, [
  svg('circle', {
    class: 'graph-node-circle',
    cx: node.x,
    cy: node.y,
    r: state.nodeRadius,
    fill: 'gray',
    'stroke-width': state.nodeRadius / 10,
    key: 'circle',
  }),
  svg('text', {
    class: 'graph-node-label-background',
    x: node.x,
    y: node.y,
    'text-anchor': 'middle',
    'dominant-baseline': 'central',
    fill: 'black',
    'font-size': state.nodeRadius * 0.7,
    key: 'label-background',
  }, node.label),
  svg('text', {
    class: 'graph-node-label',
    x: node.x,
    y: node.y,
    'text-anchor': 'middle',
    'dominant-baseline': 'central',
    fill: 'black',
    'font-size': state.nodeRadius * 0.7,
    key: 'label',
  }, node.label),
])
;

const render = (state) =>
  svg('g', [
    svg('rect', {
      x: state.graph.bounds.minX,
      y: state.graph.bounds.minY,
      width: state.graph.bounds.maxX - state.graph.bounds.minX,
      height: state.graph.bounds.maxY - state.graph.bounds.minY,
      fill: 'none',
      attributes: {
        'data-background': state.mode,
        'data-transient-edge':
          state.transientEdge === null ? void 0 : 'true',
      },
    }),

    state.graph.nodes.map((node, nodeIndex) =>
      renderNode(state, node, nodeIndex)
    ).toArray(),

    state.graph.edges.map((edge, edgeIndex) =>
      renderEdge(state, edgeIndex, edge)
    ).toArray(),

    IF(state.transientEdge, () =>
      renderEdge(state, state.transientEdge, state.graph.edges.size, true)
    ),

    IF(state.transientNode !== null, () =>
      svg('g', {
        class: 'graph-node state-transient',
        key: 'transient-node',
      }, [
        svg('circle', {
          class: 'graph-node-circle',
          cx: state.transientNode.x,
          cy: state.transientNode.y,
          r: state.nodeRadius,
          fill: 'gray',
          'stroke-width': state.nodeRadius / 10,
        }),
      ])
    ),
  ])
;

export default (state$) =>
  state$.map(render)
;
