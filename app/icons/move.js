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
    d: `M55.6,55.6L55.6,24L40,24L64,0L88,24L72.4,
    24L72.4,55.6L104,55.6L104,40L128,64L104,88L104,
    72.4L72.4,72.4L72.4,104L88,104L64,128L40,104L55.6,
    104L55.6,72.4L24,72.4L24,88L0,64L24,40L24,55.6L55.6,
    55.6Z`,
  }),
]);
