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
    d: `M46,89.201L117.692,17.509L127.591,27.409L55.899,
    99.101L55.903,99.104L46.003,109.003L46,109L45.997,
    109.003L36.097,99.104L36.1,99.101L0.627,63.627L10.526,
    53.727L46,89.201Z`,
  }),
]);
