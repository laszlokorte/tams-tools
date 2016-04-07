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
  svg('circle', {
    class: 'icon-stroke',
    'stroke-dasharray': '20, 10',
    'stroke-width': '15',
    fill: 'none',
    stroke: 'black',
    cx: 64,
    cy: 64,
    r: 64,
  }),
  svg('g', {
    transform: 'scale(0.5) translate(64, 64)',
  }, [
    svg('path', {
      class: 'icon-shape',
      d: `M76.5,51.5l51.5,0l0,25l-51.5,0l0,51.5l-25,0l0,-51.5
      l-51.5,0l0,-25l51.5,0l0,-51.5l25,0l0,51.5Z`,
    }),
  ]),
]);
