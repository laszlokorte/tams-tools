import {Observable as O} from 'rx';

import {div, h1, h3, ul, li, button, input} from '@cycle/dom';

import examples from './examples';

const renderJsonImport = () => [
  h3('From JSON File'),
  div([
    input('.block-button', {
      attributes: {'data-file-picker': 'json'},
      value: '',
      type: 'file',
    }),
  ]),
];

const renderExamples = () => [
  h3('Examples'),
  ul('.block-list.style-small', [
    examples.map((example) =>
      li([button('.block-button', {
        attributes: {
          'data-open-json': JSON.stringify(example.data),
        },
      }, example.name)])
    ),
  ]),
];

const render = () => div([
  h1('.modal-box-title', 'Open...'),
  renderExamples(),
  renderJsonImport(),
])
;

export default (state$) =>
  O.combineLatest(state$, render)
;
