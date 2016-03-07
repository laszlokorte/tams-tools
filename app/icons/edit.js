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
    d: `M12,0c6.623,0 12,5.377 12,12c0,6.623 -5.377,12
    -12,12c-6.623,0 -12,-5.377 -12,-12c0,-6.623 5.377,-12
    12,-12ZM7.091,13.636l3.273,3.273l-4.364,1.091l1.091,
    -4.364ZM8.182,12.545l6.545,-6.545l3.273,3.273l-6.545,
    6.545l-3.273,-3.273Z`,
  }),
]);
