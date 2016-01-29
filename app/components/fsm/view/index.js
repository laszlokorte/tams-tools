import {div, ul, li, h3} from '@cycle/dom';

import './index.styl';

const render = (state) => div([
  div('.dummy', 'Hello world'),
  h3('Inputs'),
  ul('.dummy', state.fsm.inputs.map((input) =>
    li(input.name)
  ).toArray()),
  h3('Outputs'),
  ul('.dummy', state.fsm.outputs.map((output) =>
    li(output.name)
  ).toArray()),
])
;

export default (state$) =>
  state$.map(render)
;
