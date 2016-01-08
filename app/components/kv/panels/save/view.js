import {div, h1, h3, a, textarea} from '@cycle/dom';
import SelectAllHook from 'select-all-hook';

import formatPLA from '../../../pla/lib/text-format';

const render = ({pla$, json$, props: {visible}}) => div([
  h1('.modal-box-title', 'Export...'),
  h3('PLA'),
  div(pla$
    .map(formatPLA)
    .startWith('')
    .map((text) => textarea('.export-text', {
      focus: visible && new SelectAllHook(),
      attributes: {readonly: true},
    }, text))),
  h3('JSON'),
  div(json$
    .startWith('')
    .map((text) => div([
      a('.block-button',{
        href: URL.createObjectURL(new Blob([text], {type: 'text/json'})),
        attributes: {
          'data-download': 'json',
          download: 'kv-diagram.json',
        },
      }, 'Save...'),
    ]))
  ),
])
;

export default (state$) =>
  state$.map((state) => render(state))
;
