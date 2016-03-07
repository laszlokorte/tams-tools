import {svg} from '@cycle/dom';

export default (size) => svg('svg', {
  attributes: {
    preserveAspectRatio: 'xMidYMid meet',
    'aria-hidden': true,
    class: 'svg-icon',
    viewBox: '0 0 24 24',
    width: size,
    height: size,
  },
}, [
  svg('path', {
    class: 'icon-shape',
    d: `M22.5,3.847l-4.5,0c-0.829,0 -1.5,0.671 -1.5,
    1.5l-12,0l0,1.5l17.67,0l-2.02,10.102l-2.15,-8.602l-18,
    0l3,12l18,0l3,-15c0,-0.829 -0.671,-1.5 -1.5,-1.5Z`,
  }),
]);
