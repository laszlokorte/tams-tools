import {div, textarea} from '@cycle/dom';

import './index.styl';

const render = (tokens) =>
  div([
    div('.logic-input', [
      textarea('.logic-input-field'),
      div('.logic-input-background'),
    ]),
    tokens.map((token) =>
      div('.token', token)
    ),
  ])
;

export default (state$) =>
  state$.map(render)
;
