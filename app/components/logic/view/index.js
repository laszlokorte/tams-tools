import {div, textarea, h2, ul, li} from '@cycle/dom';

import './index.styl';

const render = (state) =>
  div([
    div('.logic-input', [
      textarea('.logic-input-field', {
        placeholder: 'Enter some logic expression...',
      }),
      div('.logic-input-background'),
    ]),
    state && state.expression && [
      div([
        state.expression.toString(),
        h2('Variables'),
        ul(state.identifiers.map(
          (name) => li([name])
        ).toArray()),
      ]),
    ],
    state && state.error && [
      h2('Error'),
      div([
        state.error.toString(),
      ]),
    ],
  ])
;

export default (state$) =>
  state$.map(render)
;
