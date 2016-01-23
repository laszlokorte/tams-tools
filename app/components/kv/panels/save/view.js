import {div, h1, h3, a, textarea} from '@cycle/dom';

import formatPLA from '../../../pla/lib/text-format';

const render = ({pla, json}) => div([
  h1('.modal-box-title', 'Export...'),
  h3('PLA'),
  div([
    textarea('.export-text', {
      attributes: {readonly: true},
    }, formatPLA(pla)),
  ]),
  h3('JSON'),
  div([
    a('.block-button',{
      href: URL.createObjectURL(
        new Blob([json.toString()], {type: 'text/json'})
      ),
      attributes: {
        'data-download': 'json',
        download: 'kv-diagram.json',
      },
    }, 'Save...'),
  ]),
])
;

export default (state$) =>
  state$.map((state) => render(state))
;
