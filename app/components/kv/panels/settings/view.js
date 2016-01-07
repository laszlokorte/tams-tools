import {div, h1, h3, ul, li, label, input} from '@cycle/dom';

export default () => div([
  h1('.modal-box-title', 'Settings'),
  h3('Cell view'),
  ul('.block-list', [
    li([label('.block-button', [
      input({
        type: 'radio',
        name: 'view',
        value: 'function',
        checked: true,
      }),
      'Show function value',
    ])]),
    li([label('.block-button', [
      input({
        type: 'radio',
        name: 'view',
        value: 'decimal',
      }),
      'Show decimal index',
    ])]),
    li([label('.block-button', [
      input({
        type: 'radio',
        name: 'view',
        value: 'binary',
      }),
      'Show binary index',
    ])]),
  ]),
])
;
