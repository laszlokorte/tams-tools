import {
  div, span, textarea, h2, ul, li,
  table, tr, th, td, select, option
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
    return expression.name;
  case 'constant':
    return expression.value;
  default:
    throw new Error(`unknown node: ${expression.node}`);
  }
};

const markError = (string, error) => {
  if (!error || !error.loc) {
    return [string];
  } else {
    const loc = error.loc;
    const lines = string.split('\n');
    const linesBefore = lines.slice(0, loc.first_line - 1)
      .join('').length + loc.first_line - 1;
    const start = linesBefore + loc.last_column;
    const end = linesBefore + loc.last_column + error.text.length;

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
  div([
    select('.syntax-selector',{
      name: 'language',
    }, [
      option({value: 'c'}, 'C'),
      option({value: 'java'}, 'Java'),
      option({value: 'python'}, 'Python'),
      option({value: 'latex'}, 'Latex'),
    ]),
    div('.logic-input', [
      textarea('.logic-input-field', {
        placeholder: 'Enter some logic expression...',
      }),
      div('.logic-input-overlay', [
        state ? markError(state.string, state.error) : '',
      ]),
    ]),
    state && state.expressions && [
      div([
        h2('Expressions'),
        ul('.expression-list', state.expressions.map((expr) =>
          li('.expression-list-item', expressionToString(expr))
        ).toArray()),
        h2('Variables'),
        ul('.variable-list', state.identifiers.map(
          (name) => li('.variable-list-item', name)
        ).toArray()),
        h2('Table'),
        div('.table-scroller', [
          div('.table-scroller-body', [
            table('.table', [
              tr('.table-head-row', [
                state.identifiers.map(
                  (name) => th('.table-head-cell',name)
                ).toArray(),
                state.subExpressions.map(
                  (expr) => th('.table-head-cell', expressionToString(expr))
                ).toArray(),
              ]),
              state.table.map(
              (row) => tr('.table-body-row', [
                state.identifiers.map(
                  (name, i, all) => td('.table-body-cell' +
                  (i + 1 === all.size ? '.table-group-end' : ''), [
                    row.identifierValues.get(name).toString(),
                  ])
                ).toArray(),
                row.values.map((val) =>
                  td('.table-body-cell', val.toString())
                ).toArray(),
              ])).toArray(),
            ]),
          ]),
        ]),
      ]),
    ],
    state && state.error && [
      h2('Error'),
      div([
        state.error.token ?
        'Unexpected token: ' + state.error.token :
        'Unexpected character'
        ,
      ]),
    ],
  ])
;

export default (state$) =>
  state$.map(render)
;
