import {
  div, h1, h3,
  textarea,
} from '@cycle/dom';

const render = ({table}) => div([
  h1('.modal-box-title', 'Export...'),
  h3('ASCII Table'),
  div([
    textarea('.export-text', {
      attributes: {readonly: true},
    }, table ? table.toString() : ''),
  ]),
])
;

export default (state$) =>
  state$.map((state) => render(state))
;
