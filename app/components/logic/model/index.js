import {Observable as O} from 'rx';
import I from 'immutable';
import parser from '../lib/syntax/logic-c.jison';

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
    .map((expression) => ({
      expression,
      identifiers: collectIdentifiers(expression, I.Set()),
      treeHeight: treeHeight(expression, 0)
    }))
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
