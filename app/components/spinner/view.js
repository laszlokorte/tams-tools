import {div, span, button} from '@cycle/dom';

import './view.styl';

const render = ({value}) =>
  div('.spinner-container', [
    button('.spinner-decrement', {
      attributes: {'data-decrement': true},
    }),
    span('.spinner-value', `${value}`),
    button('.spinner-increment', {
      attributes: {'data-increment': true},
    }),
  ])
;

export default (state$) =>
  state$.map(render)
;
