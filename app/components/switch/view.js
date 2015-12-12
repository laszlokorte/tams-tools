import {div, button} from '@cycle/dom';

import './view.styl';

const render = ({enabled}) =>
  div('.switch-container', [
    button('.switch-button', {
      attributes: {'data-switch-state': enabled ?
      'false' : 'true'},
    }, enabled ? 'ON' : 'OFF'),
  ])
;

export default (state$) =>
  state$.map(render)
;
