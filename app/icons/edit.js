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
    d: `M0,18.933L0,24L5.067,24L19.733,9.2L14.667,4.133
    L0,18.933ZM23.6,5.333C24.133,4.8 24.133,4
    23.6,3.467L20.533,0.4C20,-0.133 19.2,-0.133
    18.667,0.4L16.267,2.8L21.333,7.867L23.6,5.333Z`,
  }),
]);
