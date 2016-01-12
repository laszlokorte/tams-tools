import {Observable as O} from 'rx';
import I from 'immutable';
import parser from '../lib/syntax/logic-c.jison';

const row = I.Record({
  identifierValues: I.Map(),
  value: null,
});

const evaluateExpression = (expression, identifierMap) => {
  if (expression === null) {
    return null;
  }
  switch (expression.node) {
  case 'binary':
    switch (expression.operator) {
    case 'AND':
      return evaluateExpression(expression.lhs, identifierMap) &&
        evaluateExpression(expression.rhs, identifierMap)
      ;
    case 'OR':
      return evaluateExpression(expression.lhs, identifierMap) ||
        evaluateExpression(expression.rhs, identifierMap)
      ;
    case 'XOR':
      return !evaluateExpression(expression.lhs, identifierMap) !==
        !evaluateExpression(expression.lhs, identifierMap)
      ;
    default:
      throw new Error(`unknown operator: ${expression.operator}`);
    }
    break;
  case 'unary':
    switch (expression.operator) {
    case 'NOT':
      return !evaluateExpression(expression.operand, identifierMap);
    default:
      throw new Error(`unknown operator: ${expression.operator}`);
    }
    break;
  case 'group':
    return evaluateExpression(expression.content, identifierMap);
  case 'identifier':
    return !!identifierMap.get(expression.name);
  case 'constant':
    return expression.value;
  default:
    throw new Error(`unknown node: ${expression.node}`);
  }
};

const evaluateAll = (expression, identifiers, acc = I.List(), counter = Math.pow(2, identifiers.size) - 1) => {
  if (counter < 0) {
    return acc.reverse();
  }

  const identifierMap = I.Map(identifiers.map(
    (name, i) => [name, !!(Math.pow(2, i) & counter)]
  ));

  return evaluateAll(
    expression,
    identifiers,
    acc.push(row({
      identifierValues: identifierMap,
      value: evaluateExpression(expression, identifierMap),
    })),
    counter - 1
  );
};

const collectIdentifiers = (expression, acc) => {
  if (expression === null) {
    return acc;
  }
  switch (expression.node) {
  case 'binary':
    return collectIdentifiers(expression.lhs, acc).union(
      collectIdentifiers(expression.rhs, acc)
    );
  case 'unary':
    return collectIdentifiers(expression.operand, acc);
  case 'group':
    return collectIdentifiers(expression.content, acc);
  case 'identifier':
    return acc.add(expression.name);
  default:
    return acc;
  }
};

const treeHeight = (expression, acc) => {
  if (expression === null) {
    return acc;
  }
  switch (expression.node) {
  case 'binary':
    return Math.max(
      treeHeight(expression.lhs, acc + 1),
      treeHeight(expression.rhs, acc + 1)
    );
  case 'unary':
    return treeHeight(expression.operand, acc + 1);
  case 'group':
    return treeHeight(expression.content, acc + 1);
  default:
    return acc;
  }
};

export default (actions) => {
  const parsed$ = actions.input$
    .map(::parser.parse)
    .map((expression) => {
      const identifiers = collectIdentifiers(expression, I.Set()).toList();
      const table = evaluateAll(expression, identifiers);
      return {
        expression,
        identifiers: identifiers,
        treeHeight: treeHeight(expression, 0),
        table,
      };
    })
  ;

  const c = (e) =>
    O.just({
      error: e,
    }).concat(parsed$).catch(c)
  ;

  return parsed$.catch(c)
    .startWith(null);
}
;
