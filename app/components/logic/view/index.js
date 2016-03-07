import {Observable as O} from 'rx';

import {
  div, h2,
  select, option,
  label, input, button,
} from '@cycle/dom';

import './index.styl';

const render = (state, field, table) =>
  div('.app', [
    div('.app-head', [
      div('.action-panel', [
        div('.action-list', [
          div('.action-list-item', [
            button('.action-button-open', {
              attributes: {'data-panel': 'open'},
              title: 'Open Diagram...',
            }, 'Open...'),
          ]),
          div('.action-list-item', [
            button('.action-button-export', {
              attributes: {'data-panel': 'save'},
              title: 'Export Diagram...',
            }, 'Export...'),
          ]),
          div('.action-list-item', [
            button('.action-button-help', {
              attributes: {'data-panel': 'help'},
              title: 'Help...',
            }, 'Help'),
          ]),
        ]),
      ]),
      div('.field-panel', [field]),
    ]),
    div('.app-body', [
      state.expression.result &&
      state.expression.result.expressions.size ?
      div([
        h2('Table'),

        select('.format-select', state.formatList.map((f) =>
          option({
            value: f.id,
            selected: state.outputFormat === 'math',
          }, f.format.name)
        ).toArray()),

        label([
          input({
            type: 'checkbox',
            name: 'subexpressions',
            checked: state.showSubExpressions,
          }),
          'Show sub expressions',
        ]),
        table,
      ]) : null,
    ]),
  ])
;

export default (state$, field$, table$, {panel$s}) =>
  O.combineLatest(state$, field$, table$, ...panel$s,
    (state, field, table, ...panels) =>
      div([
        panels,
        render(state, field, table),
      ])
  )
;
