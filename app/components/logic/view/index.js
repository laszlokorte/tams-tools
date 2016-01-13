import I from 'immutable';
import {
  svg, div, span, textarea, h2, ul, li,
  table, tr, th, td,
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

const expressionTree = (expression, x, y, width, acc) => {
  if (expression === null) {
    return acc;
  }

  switch (expression.node) {
  case 'binary':
    return expressionTree(
      expression.rhs, x + width / 4, y + 100, width / 2,
      acc.push(
        svg('circle', {
          cx: x,
          cy: y,
          r: 5,
        })
      )
      .push(
        svg('line', {
          x1: x,
          y1: y,
          x2: x + width / 4,
          y2: y + 100,
          'stroke-width': 2,
          stroke: 'lightgray',
        })
      )
      .push(
        svg('text', {
          x: x,
          y: y - 15,
          'text-anchor': 'middle',
          'alignment-baseline': 'middle',
        }, expression.operator)
      )
    )
    .concat(expressionTree(
      expression.lhs, x - width / 4, y + 100, width / 2,
      acc
      .push(
        svg('line', {
          x1: x,
          y1: y,
          x2: x - width / 4,
          y2: y + 100,
          'stroke-width': 2,
          stroke: 'lightgray',
        })
      )
      .push(
        svg('text', {
          x: x,
          y: y - 15,
          'text-anchor': 'middle',
          'alignment-baseline': 'middle',
        }, expression.operator)
      )
    ));
  case 'unary':
    return expressionTree(expression.operand, x, y + 50, width,
      acc.push(
        svg('circle', {
          cx: x,
          cy: y,
          r: 5,
        })
      )
      .push(
        svg('line', {
          x1: x,
          y1: y,
          x2: x,
          y2: y + 50,
          'stroke-width': 2,
          stroke: 'lightgray',
        })
      )
      .push(
        svg('text', {
          x: x - 15,
          y: y,
          'text-anchor': 'end',
          'alignment-baseline': 'middle',
        }, expression.operator)
      )
    );
  case 'group':
    return expressionTree(expression.content, x, y + 50, width,
      acc.push(
        svg('circle', {
          cx: x,
          cy: y,
          r: 5,
        })
      )
      .push(
        svg('line', {
          x1: x,
          y1: y,
          x2: x,
          y2: y + 50,
          'stroke-width': 2,
          stroke: 'lightgray',
        })
      )
    );
  case 'identifier':
    return acc.push(
      svg('circle', {
        cx: x,
        cy: y,
        r: 5,
      })
    ).push(
      svg('text', {
        x: x,
        y: y + 20,
        'text-anchor': 'middle',
        'alignment-baseline': 'middle',
      }, expression.name)
    );
  case 'constant':
    return acc.push(
      svg('circle', {
        cx: x,
        cy: y,
        r: 5,
      })
    ).push(
      svg('text', {
        x: x,
        y: y + 20,
        'text-anchor': 'middle',
        'alignment-baseline': 'middle',
      }, expression.value.toString())
    );
  default:
    return acc;
  }
};

const markError = (string, error) => {
  if (!error) {
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
        string.substring(start, end)
      ),
      string.substring(end),
    ];
  }
};

const render = (state) =>
  div([
    div('.logic-input', [
      textarea('.logic-input-field', {
        placeholder: 'Enter some logic expression...',
      }),
      div('.logic-input-overlay', [
        state ? markError(state.string, state.error) : '',
      ]),
    ]),
    state && state.expression && [
      div([
        expressionToString(state.expression),
        h2('Variables'),
        ul(state.identifiers.map(
          (name) => li([name])
        ).toArray()),
        h2('Tree'),
        svg('svg', {
          attributes: {
            style: 'border: 1px solid black',
            width: 800,
            height: 100 * (1 + state.treeHeight),
            class: 'graphics-root',
            viewBox: '0 0 400 ' + (100 * (1 + state.treeHeight)),
            preserveAspectRatio: 'xMidYMin meet',
          },
        }, [
          expressionTree(state.expression, 200, 50, 700, I.List()).toArray(),
        ]),
        h2('Table'),
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
    ],
    state && state.error && [
      h2('Error'),
      div([
        'Unexpected token: ' + state.error.token,
      ]),
    ],
  ])
;

export default (state$) =>
  state$.map(render)
;
