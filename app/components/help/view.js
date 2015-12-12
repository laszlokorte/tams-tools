import {div, button} from '@cycle/dom';

import './view.styl';

const render = ({visible, content$}) =>
div('.help-container', {
  className: visible ? 'state-visible' : 'state-hidden',
}, [
  div('.help-background'),
  div('.help-box', [
    button('.help-box-close', {
      attributes: {'data-help': false},
    }, 'Close'),
    div('.help-box-body',
      content$
    ),
  ]),
]);

export default (state$) =>
  state$.map(render)
;
