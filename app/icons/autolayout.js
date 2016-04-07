import {svg} from '@cycle/dom';

export default (size) => svg('svg', {
  attributes: {
    preserveAspectRatio: 'xMidYMid meet',
    'aria-hidden': true,
    class: 'svg-icon',
    viewBox: '0 0 128 128',
    width: size,
    height: size,
  },
}, [
  svg('path', {
    class: 'icon-shape',
    d: `M62.5,18L72.042,47.367L102.92,47.367L77.939,
    65.516L87.481,94.883L62.5,76.734L37.519,94.883L47.061,
    65.516L22.08,47.367L52.958,47.367L62.5,18Z`,
  }),
  svg('circle', {
    class: 'icon-shape',
    cx: 36,
    cy: 20,
    r: 13,
  }),
  svg('circle', {
    class: 'icon-shape',
    cx: 92,
    cy: 20,
    r: 13,
  }),
  svg('circle', {
    class: 'icon-shape',
    cx: 110,
    cy: 70,
    r: 13,
  }),
  svg('circle', {
    class: 'icon-shape',
    cx: 64,
    cy: 105,
    r: 13,
  }),
  svg('circle', {
    class: 'icon-shape',
    cx: 17,
    cy: 70,
    r: 13,
  }),
]);
