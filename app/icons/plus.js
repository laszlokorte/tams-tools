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
    d: `M76.5,51.5l51.5,0l0,25l-51.5,0l0,51.5l-25,0l0,-51.5
    l-51.5,0l0,-25l51.5,0l0,-51.5l25,0l0,51.5Z`,
  }),
]);
