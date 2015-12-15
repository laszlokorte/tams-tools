import {div, button} from '@cycle/dom';

import './view.styl';

const render = ({visible, content$}) =>
div('.modal-container', {
  className: visible ? 'state-visible' : 'state-hidden',
}, [
  div('.modal-background'),
  div('.modal-box', [
    button('.modal-box-close', {
      attributes: {'data-modal-close': true},
    }, 'Close'),
    div('.modal-box-body',
      content$
    ),
  ]),
]);

export default (state$) =>
  state$.map(render)
;
