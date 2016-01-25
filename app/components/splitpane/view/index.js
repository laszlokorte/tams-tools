import {div} from '@cycle/dom';

import './index.styl';

const render = (state) =>
  div('.splitpane-container', [
    div('.splitpane-body.splitpane-body-left', {
      key: 'left-pane',
      style: {width: `${state.proportion * 100}%`},
    }, state.firstChild),
    div('.splitpane-body.splitpane-body-right', {
      key: 'right-pane',
      style: {width: `${100 - state.proportion * 100}%`},
    }, state.secondChild),
    div('.splitpane-handle.splitpane-handle-horizontal', {
      key: 'handle',
      style: {left: `${state.proportion * 100}%`},
    }, "Handle"),
  ])
;

export default (state$) =>
  state$.map(render)
;
