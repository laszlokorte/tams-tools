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
  style: {
    fillRule: 'evenodd',
    clipRule: 'evenodd',
  },
}, [
  svg('path', {
    class: 'icon-shape',
    d: `M64,2C98.219,2 126,29.781 126,64C126,98.219 98.219,126 64,126C29.781,126 2,98.219 2,64C2,29.781 29.781,2 64,2ZM99.019,88.711L88.711,99.019L64,74.308L39.289,99.019L28.981,88.711L53.692,64L28.981,39.289L39.289,28.981L64,53.692L88.711,28.981L99.019,39.289L74.308,64L99.019,88.711Z`,
  }),
]);
