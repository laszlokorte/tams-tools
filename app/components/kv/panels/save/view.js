import {div, h1, h3, a, textarea, input} from '@cycle/dom';

import mathFormatter from '../../../logic/lib/formatter/math';

import formatPLA from '../../../pla/lib/text-format';
import plaFormula from '../../../pla/lib/formula';

const render = ({pla, json}) => div([
  h1('.modal-box-title', 'Export...'),
  h3('PLA'),
  div([
    textarea('.export-text', {
      attributes: {readonly: true},
    }, formatPLA(pla)),
  ]),
  h3(`Formula (${pla.mode ? pla.mode.toUpperCase() : '?'})`),
  div([
    input('.export-text-single', {
      attributes: {readonly: true},
      value: plaFormula(mathFormatter, pla),
    }),
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
