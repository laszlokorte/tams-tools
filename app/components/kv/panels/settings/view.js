import {div, h1, h3, ul, li, label, input} from '@cycle/dom';

export default () => div([
  h1('.modal-box-title', 'Settings'),
  h3('Anzeige'),
  ul('.block-list', [
    li([label('.block-button', [
      input({
        type: 'radio',
        name: 'view',
        value: 'function',
        checked: true,
      }),
      'Funktionswert Anzeigen',
    ])]),
    li([label('.block-button', [
      input({
        type: 'radio',
        name: 'view',
        value: 'decimal',
      }),
      'Dezimalindex Anzeigen',
    ])]),
    li([label('.block-button', [
      input({
        type: 'radio',
        name: 'view',
        value: 'binary',
      }),
      'Binärindex anzeigen',
    ])]),
  ]),
])
;
