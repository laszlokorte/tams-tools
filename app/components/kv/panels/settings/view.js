import {div, h1, h3, ul, li, label, input} from '@cycle/dom';

const render = ({view}) => div([
  h1('.modal-box-title', 'Settings'),
  h3('Cell view'),
  ul('.block-list', [
    li([label('.block-button', [
      input({
        type: 'radio',
        name: 'view',
        value: 'function',
        checked: view === 'function',
      }),
      'Show function value',
    ])]),
    li([label('.block-button', [
      input({
        type: 'radio',
        name: 'view',
        value: 'decimal',
        checked: view === 'decimal',
      }),
      'Show decimal index',
    ])]),
    li([label('.block-button', [
      input({
        type: 'radio',
        name: 'view',
        value: 'binary',
        checked: view === 'binary',
      }),
      'Show binary index',
    ])]),
  ]),
])
;

export default (state$) =>
  state$.map(render)
;
