import {svg} from '@cycle/dom';

import './view.styl';

const render = ({options, data, active}) =>
  svg('g',[
    svg('rect', {
      attributes: {
        x: 100,
        y: 100,
        width: 100,
        height: 100,
        class: 'test-rect' + (active ? ' state-active' : ''),
      },
    })
  ])
;

export default (state$) =>
  state$.map(render)
;
