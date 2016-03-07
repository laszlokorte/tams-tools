import {Observable as O} from 'rx';

import {div, h1, h3, ul, li, button, input} from '@cycle/dom';

import examples from './examples';

import {IF} from '../../../../lib/h-helper';

const renderExpressionImport = (state, logicField) => [
  h3('From Expressions'),
  logicField,
  IF(state.validExpression, () =>
    button('.block-button-dark', {
      attributes: {'data-action': 'import-expression'},
    }, 'Import Expressions')
  ),
  IF(state.expressionError !== null, () =>
    div('.logic-panel-body', [
      div('.error-box', state.expressionError),
    ])
  ),
];

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

const render = (state, logicField) => div([
  h1('.modal-box-title', 'Open...'),
  renderExamples(),
  renderExpressionImport(state, logicField),
  renderJsonImport(),
])
;

export default (state$, logicField$) =>
  O.combineLatest(state$, logicField$, render)
;
