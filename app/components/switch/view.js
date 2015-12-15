import {div, button} from '@cycle/dom';

import './view.styl';

const render = ({enabled, label}) =>
  div('.switch-container', [
    button('.switch-button', {
      className: enabled ? 'state-on' : 'state-off',
      attributes: {'data-switch-state': enabled ?
      'false' : 'true'},
    }, label),
  ])
;

export default (state$) =>
  state$.map(render)
;
