import {div, h1, h3, a, textarea} from '@cycle/dom';

import formatPLA from '../../../pla/lib/text-format';

export default (pla$, json$) => div([
  h1('.modal-box-title', 'Export...'),
  h3('PLA'),
  div(pla$
    .map(formatPLA)
    .startWith('')
    .map((text) => textarea('.export-text', {
      attributes: {readonly: true},
    }, text))),
  h3('JSON'),
  div(json$
    .startWith('')
    .map((text) => div([
      a('.block-button',{
        href: URL.createObjectURL(new Blob([text], {type: 'text/json'})),
        attributes: {
          download: 'KV.json',
        },
      }, 'Save...'),
    ]))
  ),
])
;
