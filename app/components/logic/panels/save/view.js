import {div, h1, h3, a, textarea} from '@cycle/dom';
import SelectAllHook from 'select-all-hook';

const render = ({table$, json$, props: {visible}}) => div([
  h1('.modal-box-title', 'Export...'),
  h3('ASCII Table'),
  div(table$
    .startWith('')
    .map((text) => textarea('.export-text', {
      focus: visible && new SelectAllHook(),
      attributes: {readonly: true},
    }, text))),
])
;

export default (state$) =>
  state$.map((state) => render(state))
;
