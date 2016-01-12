import {div, textarea} from '@cycle/dom';

import './index.styl';

const render = (result) =>
  div([
    div('.logic-input', [
      textarea('.logic-input-field', {
        placeholder: 'Enter some logic expression...',
      }),
      div('.logic-input-background'),
    ]),
    div([
      result && result.toString(),
    ]),
  ])
;

export default (state$) =>
  state$.map(render)
;
