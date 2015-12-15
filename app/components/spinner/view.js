import {div, span, button} from '@cycle/dom';

import './view.styl';

const render = ({value, label, canIncrement, canDecrement}) =>
  div('.spinner-container', [
    div('.spinner-label', label),
    button('.spinner-button.icon-minus', {
      attributes: {
        'data-decrement': true,
      },
      disabled: !canDecrement,
    }, 'Decrement'),
    span('.spinner-value', `${value}`),
    button('.spinner-button.icon-plus', {
      attributes: {
        'data-increment': true,
      },
      disabled: !canIncrement,
    }, 'Increment'),
  ])
;

export default (state$) =>
  state$.map(render)
;
