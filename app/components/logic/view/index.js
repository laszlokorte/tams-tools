import {Observable as O} from 'rx';

import {
  div, span, textarea, h2, ul, li,
  table, tr, th, td, select, option,
  label, input, button,
} from '@cycle/dom';

import './index.styl';

const expressionToString = (expression) => {
  if (expression === null) {
    return '';
  }

  switch (expression.node) {
  case 'binary':
    return `(${expressionToString(expression.lhs)} ` +
      `${expression.operator} ` +
      `${expressionToString(expression.rhs)})`;
  case 'unary':
    return `${expression.operator}(${expressionToString(expression.operand)})`;
  case 'group':
    return `${expressionToString(expression.content)}`;
  case 'identifier':
    return expression.name.toString();
  case 'constant':
    return expression.value ? '1' : '0';
  default:
    throw new Error(`unknown node: ${expression.node}`);
  }
};

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

const render = (state) =>
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
              state.lang === 'auto' ?
              option(
                {value: 'auto', selected: true},
                `Auto detect (${state.detected || '???'})`
              ) :
              option(
                {value: 'auto', selected: false},
                `Auto detect`
              ),

              option({value: 'c', selected: state.lang === 'c'}, 'C'),
              option({value: 'python', selected: state.lang === 'pyhton'}, 'Python'),
              option({value: 'math', selected: state.lang === 'math'}, 'Math'),
              option({value: 'latex', selected: state.lang === 'latex'}, 'Latex'),
            ]),
          ]),
          div('.logic-input', [
            textarea('.logic-input-field', {
              placeholder: 'Enter some logic expression...',
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
      state && state.expressions && state.expressions.size ? [
        div([
          h2('Expressions'),
          ul('.expression-list', state.expressions.map((expr) =>
            li('.expression-list-item', expressionToString(expr))
          ).toArray()),
          h2('Variables'),
          ul('.variable-list', state.identifiers.map(
            (identifier) => li('.variable-list-item', identifier.name)
          ).toArray()),
          h2('Table'),
          label([
            input({
              type: 'checkbox',
              name: 'subexpressions',
              checked: state.showSubExpressions,
            }),
            'Show sub expressions',
          ]),
          div('.table-scroller', [
            div('.table-scroller-body', [
              table('.table', [
                tr('.table-head-row', [
                  state.identifiers.map(
                    (identifier) => th('.table-head-cell', identifier.name)
                  ).toArray(),
                  state.subExpressions.map(
                    (expr) => th('.table-head-cell', expressionToString(expr))
                  ).toArray(),
                ]),
                state.table.map(
                (row, index) => tr('.table-body-row', {
                  className: state.selectedRow === index ?
                    'state-selected' : void 0,
                  attributes: {
                    'data-index': index,
                  },
                }, [
                  state.identifiers.map(
                    (identifier, i, all) => td('.table-body-cell' +
                    (i + 1 === all.size ? '.table-group-end' : ''), [
                      row.identifierValues.get(identifier) ? '1' : '0',
                    ])
                  ).toArray(),
                  row.values.map((val) =>
                    td('.table-body-cell', val ? '1' : '0')
                  ).toArray(),
                ])).toArray(),
              ]),
            ]),
          ]),
        ]),
      ] : null,
    ]),
  ])
;

export default (state$, {panel$s}) =>
  O.combineLatest(state$, ...panel$s,
    (state, ...panels) =>
      div([
        panels,
        render(state),
      ])
  )
;
