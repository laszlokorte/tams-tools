import {div, button} from '@cycle/dom';

import './view.styl';

const render = ({options, label: radioLabel}) =>
  div('.radio-container', [
    div('.radio-container-label', radioLabel),
    options.map(
      ({value, label, enabled}) =>
      button('.radio-option', {
        className: enabled ? 'state-active' : '',
        attributes: {'data-radio-state': value},
      }, label)
    ),
  ])
;

export default (state$) =>
  state$.map(render)
;
