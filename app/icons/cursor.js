import {svg} from '@cycle/dom';

export default (size) => svg('svg', {
  attributes: {
    preserveAspectRatio: 'xMidYMid meet',
    'aria-hidden': true,
    class: 'svg-icon',
    viewBox: '0 0 140 140',
    width: size,
    height: size,
  },
}, [
  svg('path', {
    class: 'icon-shape',
    d: `M37.738,0L34.322,101.471L58.335,
    82.164L77.232,128.126L100.142,118.707L81.258,
    72.75L111.895,69.578L37.738,0Z`,
  }),
]);
