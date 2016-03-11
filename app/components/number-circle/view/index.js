import {svg} from '@cycle/dom';

import {IF} from '../../../lib/h-helper';

import './index.styl';

const renderArc = (dots, selected, radius) =>
  IF(selected !== null, () => {
    const dot = dots[selected];
    const angle = dot.angle;
    const x = Math.sin(angle) * radius;
    const y = -Math.cos(angle) * radius;
    const mid = angle > Math.PI;
    const midAngle = dots[dots.length / 2 - 1].angle;
    const reverse = angle > midAngle;

    return svg('path', {
      class: 'selection-arc',
      d: `M 0 ${-radius}
          A ${radius} ${radius} 0
          ${mid !== reverse ? 1 : 0} ${reverse ? 0 : 1}
          ${x} ${y}`,
      fill: 'none',
      'stroke-width': 10,
      'marker-end': 'url(#markerArrow)',
    });
  })
;

// the the horizontal offset for text at the given angle
// (in radians)
const textAnchor = (angle) => {
  const sin = Math.sin(angle);

  if (sin > 0.01) {
    return 'start';
  } else if (sin < -0.01) {
    return 'end';
  } else {
    return 'middle';
  }
};

// get the vertical offset for text at the given angle
// (in radians)
const baseLine = (angle) => {
  const cos = -Math.cos(angle);

  if (cos > 0.01) {
    return 'text-before-edge';
  } else if (cos < -0.01) {
    return 'text-after-edge';
  } else {
    return 'central';
  }
};

// render the dots as svg element
const render = ({radius, dots, dotRadius, overflowAngle, selected}) => {
  return svg('g', [
    svg('defs', [
      svg('marker', {
        id: 'markerArrow',
        markerWidth: 3,
        markerHeight: 4,
        refX: 2,
        refY: 2,
        orient: 'auto',
        class: 'arrow-head',
      }, [
        svg('path', {
          d: 'M0,0 L0,4 L3,2 L0,0',
        }),
      ]),
    ]),
    svg('circle', {
      class: 'number-circle-circumference',
      cx: 0,
      cy: 0,
      r: radius,
    }),
    ...dots.map((dot, dotIndex) => svg('g', {
      attributes: {
        class: 'number-dot' +
          (selected === dotIndex ? ' state-selected' : ''),
        'data-dot-index': dotIndex,
      },
    }, [
      svg('circle', {
        class: 'number-dot-background',
        cx: Math.sin(dot.angle) * radius,
        cy: -Math.cos(dot.angle) * radius,
        r: 50,
      }),
      svg('text', {
        class: 'number-dot-label',
        x: Math.sin(dot.angle) * radius,
        y: -Math.cos(dot.angle) * radius,
        fill: '#fff',
        'font-size': '50px',
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
      }, dot.value.toString()),
      svg('text', {
        class: 'number-dot-pattern',
        x: Math.sin(dot.angle) * (radius * 1 + 70),
        y: -Math.cos(dot.angle) * (radius * 1 + 70),
        fill: '#000',
        'font-size': '50px',
        'text-anchor': textAnchor(dot.angle),
        'dominant-baseline': baseLine(dot.angle),
      }, dot.pattern.toString()),
    ])),
    renderArc(dots, selected, radius - dotRadius * 1.5),
    svg('line', {
      class: 'overflow-line',
      x1: 0,
      y1: 0,
      x2: Math.sin(overflowAngle) * (radius + dotRadius * 3),
      y2: -Math.cos(overflowAngle) * (radius + dotRadius * 3),
      stroke: 'black',
      'stroke-width': '10',
    }),
  ]);
};

export default (state$) =>
  state$.map(render)
;
