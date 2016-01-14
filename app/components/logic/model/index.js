import {Observable as O} from 'rx';
import I from 'immutable';
import cParser from '../lib/syntax/logic-c.jison';
import javaParser from '../lib/syntax/logic-java.jison';
import latexParser from '../lib/syntax/logic-latex.jison';
import mathParser from '../lib/syntax/logic-math.jison';
import pythonParser from '../lib/syntax/logic-python.jison';

const row = I.Record({
  identifierValues: I.Map(),
  values: I.List(),
});

const evalBinary = (expression, identifierMap, evalExpr) => {
  switch (expression.operator) {
  case 'AND':
    return evalExpr(expression.lhs, identifierMap) &&
      evalExpr(expression.rhs, identifierMap)
    ;
  case 'OR':
    return evalExpr(expression.lhs, identifierMap) ||
      evalExpr(expression.rhs, identifierMap)
    ;
  case 'XOR':
    return !evalExpr(expression.lhs, identifierMap) !==
      !evalExpr(expression.lhs, identifierMap)
    ;
  default:
    throw new Error(`unknown operator: ${expression.operator}`);
  }
};

const evalUnary = (expression, identifierMap, evalExpr) => {
  switch (expression.operator) {
  case 'NOT':
    return !evalExpr(expression.operand, identifierMap);
  default:
    throw new Error(`unknown operator: ${expression.operator}`);
  }
};

const evaluateExpression = (expression, identifierMap) => {
  if (expression === null) {
    return null;
  }
  switch (expression.node) {
  case 'binary':
    return evalBinary(expression, identifierMap,
      evaluateExpression
    );
  case 'unary':
    return evalUnary(expression, identifierMap,
      evaluateExpression
    );
  case 'group':
    return evaluateExpression(expression.content, identifierMap,
      evaluateExpression
    );
  case 'identifier':
    return !!identifierMap.get(expression.name);
  case 'constant':
    return expression.value;
  default:
    throw new Error(`unknown node: ${expression.node}`);
  }
};

const evaluateAll = ({
  expressions, identifiers,
  acc = I.List(), counter = Math.pow(2, identifiers.size) - 1,
}) => {
  if (counter < 0) {
    return acc.reverse();
  }

  const identifierMap = I.Map(identifiers.map(
    (name, i) => [name, !!(Math.pow(2, i) & counter)]
  ));

  return evaluateAll({
    expressions,
    identifiers,
    acc: acc.push(row({
      identifierValues: identifierMap,
      values: expressions.map((expr) =>
        evaluateExpression(expr, identifierMap)
      ).toList(),
    })),
    counter: counter - 1,
  });
};

const collectSubExpressions = (
  expression, acc = I.OrderedSet(), collect = true
) => {
  if (expression === null) {
    return acc;
  }

  const newAcc = collect === true ? acc.add(expression) : acc;

  switch (expression.node) {
  case 'binary':
    return collectSubExpressions(expression.lhs, newAcc, true)
      .concat(collectSubExpressions(expression.rhs, newAcc, true));
  case 'unary':
    return collectSubExpressions(expression.operand, newAcc, true);
  case 'group':
    return collectSubExpressions(expression.content, newAcc, false);
  case 'identifier':
    return acc;
  case 'constant':
    return acc;
  default:
    throw new Error(`unknown node: ${expression.node}`);
  }
};

const collectIdentifiers = (expression, acc = I.Set()) => {
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
  case 'constant':
    return acc;
  default:
    throw new Error(`unknown node: ${expression.node}`);
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
  case 'identifier':
    return acc;
  case 'constant':
    return acc;
  default:
    throw new Error(`unknown node: ${expression.node}`);
  }
};

function ParseError(string, error) {
  this.string = string;
  this.error = error;
};

const parser = (language) => (string) => {
  try {
    return {
      string,
      expressions: language.parse(string),
    };
  } catch (e) {
    throw new ParseError(string, e.hash);
  }
};

export default (actions) => {
  const parsed$ = actions.input$.flatMapLatest((string) => {
    const single$ = O.just(string);

    return O.catch(
      single$.map(parser(cParser)),
      single$.map(parser(javaParser)),
      single$.map(parser(latexParser)),
      single$.map(parser(mathParser)),
      single$.map(parser(pythonParser))
    );
  })
    .map(({expressions, string}) => {
      const expressionList = I.List(expressions);
      const identifiers = expressionList.flatMap(
        (expression) => collectIdentifiers(expression)
      ).toSet().toList();

      const subExpressions = expressionList.flatMap(
          (expression) => collectSubExpressions(expression)
            .reverse().toList()
      );
      const table = evaluateAll({expressions: subExpressions, identifiers});
      return {
        string,
        expressions: expressionList,
        identifiers: identifiers,
        treeHeights: expressionList.map((expr) =>
          treeHeight(expr, 0)
        ).toArray(),
        table,
        subExpressions,
      };
    })
  ;

  const c = (e) =>
    O.just({
      error: e.error,
      string: e.string,
    })
      .concat(parsed$).catch(c)
  ;

  return parsed$.catch(c)
    .startWith(null);
}
;
