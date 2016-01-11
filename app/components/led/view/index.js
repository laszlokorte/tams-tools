import {div} from '@cycle/dom';

import './index.styl';

const render = (state) =>
  div([
    'Hello World',
  ])
;

export default (state$) =>
  state$.map(render)
;
