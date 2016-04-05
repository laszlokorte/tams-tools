import {svg} from '@cycle/dom';

import {IF} from '../../../lib/h-helper';

import './index.styl';

const bezierString = (path) =>
  `M${path.fromX},${path.fromY} ` +
    `c${path.c1X},${path.c1Y} ` +
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

const arrowHeadString = (path, length) => {
  const totalLength = Math.sqrt(
    path[6] * path[6] +
    path[7] * path[7]
  );

  const realLength = totalLength < length * 1.3 * 1.3 ?
  length / 1.3 : length;

  const cx = interpCubic({
    t: 0.9, start: 0,
    ctrl1: path.c1X, ctrl2: path.c2X,
    end: path.toX,
  });
  const cy = interpCubic({
    t: 0.9, start: 0,
    ctrl1: path.c1Y, ctrl2: path.c2Y,
    end: path.toY,
  });

  const angle = Math.atan2(path.toY - cy, path.toX - cx);
  const extend = Math.PI / 4;

  const angleA = angle + extend / 2;
  const angleB = angle - extend / 2;
  const tipX = path.fromX + path.toX + Math.cos(angle) * realLength / 2;
  const tipY = path.fromY + path.toY + Math.sin(angle) * realLength / 2;

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
  if (state.mode === 'connect') {
    return 'select';
  } else if (state.mode === 'view') {
    return 'select';
  } else {
    return 'none';
  }
};

const isNodeSelected = (nodeIndex, state) =>
  state.selection !== null &&
  state.selection.type === 'node' &&
  state.selection.value === nodeIndex
;

const isEdgeSelected = (edge, state) =>
  state.selection !== null &&
  state.selection.type === 'edge' &&
  state.selection.value.from === edge.fromIndex &&
  state.selection.value.to === edge.toIndex
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
        'data-target': state.mode === 'create' ? true : void 0,
        'data-background': state.mode !== 'create' ? true : void 0,
      },
    }),
    state.graph.edges.map((e) => svg('g', {
      class: 'graph-edge' + (isEdgeSelected(e, state) ?
        ' state-selected' : ''),
      attributes: {
        'data-action': edgeAction(state),
        'data-edge': `${e.fromIndex},${e.toIndex}`,
      },
    },[
      svg('path', {
        d: bezierString(e.path),
        stroke: 'black',
        'stroke-width': 5,
        fill: 'none',
      }),
      svg('polygon', {
        points: arrowHeadString(e.path, 40),
        fill: 'black',
      }),
    ])).toArray(),

    state.graph.nodes.map((n, i) => svg('g', {
      class: 'graph-node' + (isNodeSelected(i, state) ?
        ' state-selected' : ''),
      attributes: {
        'data-node-index': i,
        'data-node-x': n.x,
        'data-node-y': n.y,
        'data-action': nodeAction(state),
      },
    }, [
      svg('circle', {
        cx: n.x,
        cy: n.y,
        r: state.nodeRadius,
        fill: 'black',
      }),
      svg('text', {
        x: n.x,
        y: n.y,
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
        fill: 'white',
      }, n.label),
    ])).toArray(),

    IF(state.transientNode !== null, () =>
      svg('g', [
        svg('circle', {
          cx: state.transientNode.x,
          cy: state.transientNode.y,
          r: 50,
          fill: 'black',
        }),
        svg('text', {
          x: state.transientNode.x,
          y: state.transientNode.y,
          'text-anchor': 'middle',
          'dominant-baseline': 'central',
          fill: 'white',
        }, "New Node"),
      ])
    ),
  ])
;

export default (state$) =>
  state$.map(render)
;
