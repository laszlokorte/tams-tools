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
  svg('rect', {
    class: 'icon-shape',
    x: 0,
    y: 52,
    width: 128,
    height: 25,
  }),
]);
