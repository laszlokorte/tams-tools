import {div, button} from '@cycle/dom';

import closeIcon from '../../../icons/close';

import './index.styl';

const render = ({visible, content}) =>
  div('.modal-container', {
    'aria-hidden': visible ? true : void 0,
    className: visible ? 'state-visible' : 'state-hidden',
  }, [
    div('.modal-background'),
    div('.modal-scroll', [
      div('.modal-box', [
        button('.modal-box-close', {
          attributes: {'data-modal-close': true},
        }, closeIcon(24)),
        div('.modal-box-body',
          visible ? [content] : null
        ),
      ]),
    ]),
  ])
;

export default (state$) =>
  state$.map(render)
;
