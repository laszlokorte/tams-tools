import {Observable as O} from 'rx';

import {
  div, span, textarea, h2,
  select, option,
  label, input, button,
} from '@cycle/dom';

import {IF} from '../../../lib/h-helper';

import {expressionToString} from '../lib/formatter';

import './index.styl';

const markError = (string, error) => {
  if (!error || !error.location) {
    return [string];
  } else {
    const loc = error.location;
    const start = loc.start.offset;
    const end = loc.end.offset;

    return [
      string.substring(0, start),
      span('.overlay-text-marker.text-marker-error',
        string.substring(start, end) || ' '
      ),
      string.substring(end),
    ];
  }
};

const render = (state, table) =>
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
      div('.logic-panel', [
        div('.logic-panel-body', [
          label('.logic-language-chooser',[
            span('.logic-language-chooser-label', 'Language:'),
            select('.syntax-selector',{
              name: 'language',
            }, [
              state.langId === 'auto' ?
              option(
                {value: 'auto', selected: true},
                `Auto detect (${state.language.name || '???'})`
              ) :
              option(
                {value: 'auto', selected: false},
                `Auto detect`
              ),
              state.languageList.map((item) =>
                option({
                  value: item.id,
                  selected: state.langId === item.id,
                }, item.language.name)
              ),
            ]),
          ]),
          div('.complete-panel',
            state.completions.map((c) =>
              button('.completion-button', {
                title: 'Bottom',
                attributes: {
                  'data-action-insert': c,
                },
              }, c)
            ).toArray()
          ),
          div('.logic-input', [
            textarea('.logic-input-field', {
              value: state.string,
              placeholder: 'Enter some logic expression...',
              autocomplete: 'off',
              autocorrect: 'off',
              autocapitalize: 'off',
              spellcheck: false,
            }),
            div('.logic-input-overlay', [
              state ? markError(state.string, state.error) : '',
            ]),
          ]),

          state && state.error && div('.error-box', [
            h2('.error-box-title','Error'),
            div('.error-body',[
              state.error.token ?
              'Unexpected token: ' + state.error.token :
              state.error.message,
            ]),
          ]),
        ]),
      ]),
    ]),
    div('.app-body', [
      IF(state && state.context && state.context.expressions.size > 1, () =>
        div([
          h2('Compare expressions'),

          div('.comparator', [
            select('.compare-selection', {
              size: Math.min(3, state.context.expressions.size + 1),
            }, [
              option({value: '', selected: true}, '---'),
              state.context.expressions.map(
                (e,value) => option({value},
                  e.name || expressionToString(e.body)
                )
              ).toArray(),
            ]),
            select('.compare-selection', {
              size: Math.min(3, state.context.expressions.size + 1),
            }, [
              option({value: '', selected: true}, '---'),
              state.context.expressions.map(
                (e, value) => option({value},
                  e.name || expressionToString(e.body)
                )
              ).toArray(),
            ]),
          ]),
        ])
      ),

      state && state.context && state.context.expressions.size ?
      div([
        h2('Table'),

        select('.format-select', [
          option({
            value: 'math',
            selected: state.outputFormat === 'math',
          }, 'Math'),
          option({
            value: 'latex',
            selected: state.outputFormat === 'latex',
          }, 'Latex'),
          option({
            value: 'python',
            selected: state.outputFormat === 'python',
          }, 'Python'),
          option({
            value: 'c-bitwise',
            selected: state.outputFormat === 'c-bitwise',
          }, 'C (Bitwise)'),
          option({
            value: 'c-boolean',
            selected: state.outputFormat === 'c-boolean',
          }, 'C (Boolean)'),
        ]),

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

export default (state$, table$, {panel$s}) =>
  O.combineLatest(state$, table$, ...panel$s,
    (state, table, ...panels) =>
      div([
        panels,
        render(state, table),
      ])
  )
;
