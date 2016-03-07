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
    d: `M14.534,5.472l0,-5.472l9.382,9.382l-9.382,9.382l0,
    -5.879c-6.758,0.146 -12.409,4.825 -14.031,11.115c-0.305,
    -1.185 -0.468,-2.427 -0.468,-3.706c0,-8.073 6.468,-14.648
    14.499,-14.822Z`,
  }),
]);
