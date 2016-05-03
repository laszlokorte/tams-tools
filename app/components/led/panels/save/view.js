import {
  div, h1, h3,
  textarea, input,
} from '@cycle/dom';

const render = ({table, formula}) => div([
  h1('.modal-box-title', 'Export...'),
  h3('ASCII Table'),
  div([
    textarea('.export-text', {
      attributes: {readonly: true},
    }, table ? table.toString() : ''),
  ]),
  h3('Expression'),
  div([
    input('.export-text-single', {
      attributes: {readonly: true},
      value: table ? formula.toString() : '',
    }),
  ]),
])
;

export default (state$) =>
  state$.map((state) => render(state))
;
