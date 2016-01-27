import {div} from '@cycle/dom';

import './index.styl';

const render = (state) =>
  div('.dummy', 'Hello world')
;

export default (state$) =>
  state$.map(render)
;
