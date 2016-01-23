import {
  div, h1, h3,
  textarea, select, input,
  option,
} from '@cycle/dom';

const render = ({table}) => div([
  h1('.modal-box-title', 'Export...'),
  h3('ASCII Table'),
  div([
    textarea('.export-text', {
      attributes: {readonly: true},
    }, table ? table.toString() : ''),
  ]),
  h3('Formular'),
  div([
    select('.export-select', [
      option({value: 'c'}, 'C'),
      option({value: 'latex'}, 'Latex'),
      option({value: 'python'}, 'Python'),
    ]),
    input('.export-text-single'),
  ]),
])
;

export default (state$) =>
  state$.map((state) => render(state))
;
