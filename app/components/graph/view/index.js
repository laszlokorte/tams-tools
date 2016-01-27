import {svg} from '@cycle/dom';

import './index.styl';

const render = (state) =>
  svg('g',[
    svg('circle', {
      cx: 0,
      cy: 0,
      r: 20,
      fill: 'black',
    }),
  ])
;

export default (state$) =>
  state$.map(render)
;
