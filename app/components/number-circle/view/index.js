import {svg} from '@cycle/dom';

import {IF} from '../../../lib/h-helper';

import './index.styl';

const renderArc = (dots, selected, radius, negativeClockwise) =>
  IF(selected !== null, () => {
    const dot = dots[selected];
    const zeroDot = dots[dot.baseIndex];
    const angle = dot.angle;
    const zeroAngle = zeroDot.angle;
    const x = Math.sin(angle) * radius;
    const y = -Math.cos(angle) * radius;
    const zeroX = Math.sin(zeroAngle) * (radius - 0.1);
    const zeroY = -Math.cos(zeroAngle) * (radius - 0.1);
    const mid = Math.abs(angle - zeroAngle) >= Math.PI;

    const largeArc = mid && !dot.negative;
    const sweep = !negativeClockwise && dot.negative;

    return svg('path', {
      key: 'arc',
      class: 'selection-arc',
      d: `M ${~~zeroX} ${~~zeroY}
          A ${~~radius - 0.05} ${~~radius - 0.05} 0
          ${largeArc ? 1 : 0} ${sweep ? 0 : 1}
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

const dotColor = (neg, mag) =>
  neg ?
  `#${(100 + Math.floor(mag * 100)).toString(16)}0000` :
  `#00${(100 + Math.floor(mag * 100)).toString(16)}00`
;

const renderDot = (radius, selected, dot, dotIndex) => svg('g', {
  key: `dot-${dot.pattern}`,
  class: 'number-dot' +
    (selected === dotIndex ? ' state-selected' : ''),
  attributes: {
    'data-dot-index': dotIndex,
  },
}, [
  svg('circle', {
    key: 'dot-background',
    class: 'number-dot-background',
    cx: ~~(Math.sin(dot.angle) * radius),
    cy: ~~(-Math.cos(dot.angle) * radius),
    r: 50,
    fill: dotColor(dot.negative, dot.magnitude),
  }),
  svg('text', {
    key: 'dot-label',
    class: 'number-dot-label',
    x: ~~(Math.sin(dot.angle) * radius),
    y: ~~(-Math.cos(dot.angle) * radius),
    fill: '#fff',
    'font-size': '60',
    'text-anchor': 'middle',
    'dominant-baseline': 'central',
  }, dot.value.toString()),
  svg('text', {
    key: 'dot-pattern',
    class: 'number-dot-pattern',
    x: Math.sin(dot.angle) * (radius * 1 + 70),
    y: -Math.cos(dot.angle) * (radius * 1 + 70),
    fill: '#000',
    'font-size': '60',
    'text-anchor': textAnchor(dot.angle),
    'dominant-baseline': baseLine(dot.angle),
  }, dot.pattern.toString()),
]);

const renderOverflowLine = (angle, radius, dotRadius) =>
  svg('line', {
    class: 'overflow-line',
    x1: 0,
    y1: 0,
    x2: ~~(Math.sin(angle) * (radius + dotRadius * 3)),
    y2: ~~(-Math.cos(angle) * (radius + dotRadius * 3)),
    stroke: 'black',
    'stroke-width': '10',
  })
;

const renderWarning = (angle, radius, dotRadius) => {
  const x = Math.sin(angle) * (radius + 1.5 * dotRadius);
  const y = -Math.cos(angle) * (radius + 1.5 * dotRadius);
  const xInner = Math.sin(angle) * (radius - 1.5 * dotRadius);
  const yInner = -Math.cos(angle) * (radius - 1.5 * dotRadius);

  return svg('g', {
    class: 'warning',
  }, [
    svg('line', {
      class: 'warning-line',
      x1: ~~x,
      y1: ~~y,
      x2: ~~xInner,
      y2: ~~yInner,
      stroke: 'orange',
      'stroke-width': '10',
    }),
    svg('circle', {
      cx: ~~x,
      cy: ~~y,
      r: ~~dotRadius * 0.7,
      class: 'warning-background',
      fill: 'orange',
    }),
    svg('text', {
      x: ~~x,
      y: ~~y,
      'font-size': ~~dotRadius,
      'text-anchor': 'middle',
      'dominant-baseline': 'central',
      class: 'warning-text',
      fill: 'white',
    }, '!'),
  ]);
};

// render the dots as svg element
const render = ({
  radius, dots, dotRadius,
  overflowAngles, warningAngles,
  selected, negativeClockwise,
}) => {
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
      r: ~~radius,
    }),
    ...dots.map((d,i) => renderDot(radius, selected, d, i)),
    renderArc(dots, selected, radius - dotRadius * 1.5, negativeClockwise),
    overflowAngles.map((angle) =>
      renderOverflowLine(angle, radius, dotRadius)
    ),
    warningAngles.map((angle) =>
      renderWarning(angle, radius, dotRadius)
    ),
    svg('circle', {
      class: 'number-circle-center',
      cx: 0,
      cy: 0,
      r: 10,
    }),
  ]);
};

export default (state$) =>
  state$.map(render)
;
