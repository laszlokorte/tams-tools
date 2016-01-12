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
  case 'par':
    return collectIdentifiers(expression.content, acc);
  case 'identifier':
    return acc.add(expression.name);
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
