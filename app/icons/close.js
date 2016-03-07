import {svg} from '@cycle/dom';

export default (size) => svg('svg', {
  attributes: {
    preserveAspectRatio: 'xMidYMid meet',
    'aria-hidden': true,
    class: 'svg-icon',
    viewBox: '-100 -100 712 712',
    width: size,
    height: size,
  },
}, [
  svg('polygon', {
    class: 'icon-shape',
    points: `512,120.859 391.141,0 255.997,135.146 120.855,0
    0,120.859 135.132,256.006 0,391.146 120.855,512
    255.997,376.872 391.141,512 512,391.146 376.862,256.006`,
  }),
]);
