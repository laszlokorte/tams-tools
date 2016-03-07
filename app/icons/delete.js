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
    d: `M24.025,19.998l-4.027,4.027l-7.998,-7.999l-7.998,
    7.999l-4.027,-4.027l7.999,-7.998l-7.999,-7.998l4.027,
    -4.027l7.998,7.999l7.998,-7.999l4.027,4.027l-7.999,
    7.998l7.999,7.998Z`,
  }),
]);
