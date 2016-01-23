import {div, button} from '@cycle/dom';

import './index.styl';

const render = ({visible, content}) =>
div('.modal-container', {
  className: visible ? 'state-visible' : 'state-hidden',
}, [
  div('.modal-background'),
  div('.modal-box', [
    button('.modal-box-close', {
      attributes: {'data-modal-close': true},
    }, 'Close'),
    div('.modal-box-body',
      visible ? [content] : null
    ),
  ]),
]);

export default (state$) =>
  state$.map(render)
;
