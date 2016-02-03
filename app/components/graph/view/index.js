import {svg} from '@cycle/dom';

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

const render = (state) =>
  svg('g', [
    state.graph.edges.map((e) => svg('g', [
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
      attributes: {
        'data-node-index': i,
      },
    }, [
      svg('circle', {
        cx: n.x,
        cy: n.y,
        r: n.radius,
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
  ])
;

export default (state$) =>
  state$.map(render)
;
