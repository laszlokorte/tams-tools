import I from 'immutable';

import {identifierExpression} from './expression';

// a row of a function table
const row = I.Record({
  identifierValues: I.Map(), // The values of the inputs
  values: I.List(), // the values of the outputs
});

// logic AND supporting null as input
//
// true  AND true  <=> true
// false AND true  <=> false
// true  AND false <=> false
// false AND false <=> false
//-
// true  AND null  <=> null
// null  AND true  <=> null
// false AND null  <=> false
// null  AND false <=> false
// null  AND null  <=> null
const evalAND = (lhs, rhs) =>
  (lhs === false || rhs === false) ? false : lhs && rhs
;

// logic OR supporting null as input
//
// true  OR true  <=> true
// false OR true  <=> true
// true  OR false <=> true
// false OR false <=> false
//-
// true  OR null  <=> true
// null  OR true  <=> true
// false OR null  <=> null
// null  OR false <=> null
// null  OR null  <=> null
const evalOR = (lhs, rhs) =>
  (lhs === null && rhs === false) ? null : lhs || rhs
;

// logic XOR supporting null as input
//
// true  XOR true  <=> false
// false XOR true  <=> true
// true  XOR false <=> true
// false XOR false <=> false
//-
// true  XOR null  <=> null
// null  XOR true  <=> null
// false XOR null  <=> null
// null  XOR false <=> null
// null  XOR null  <=> null
const evalXOR = (lhs, rhs) =>
  (lhs === null || rhs === null) ? null : !lhs !== !rhs
;

// logic NOT supporting null as input
//
// NOT true  <=> false
// NOT false <=> true
// NOT null  <=> null
const evalNOT = (op) =>
  op === null ? null : !op
;

// evaluate the given binary expression
//
// identifierMap contains the values of input variables
// evalExpr is function to be used to evaluate sub expressions
const evalBinary = (binaryExpression, identifierMap, evalExpr) => {
  const lhs = evalExpr(binaryExpression.lhs, identifierMap);
  const rhs = evalExpr(binaryExpression.rhs, identifierMap);

  switch (binaryExpression.operator) {
  case 'AND': {
    return evalAND(lhs, rhs);
  }
  case 'OR': {
    return evalOR(lhs, rhs);
  }
  case 'XOR': {
    return evalXOR(lhs, rhs);
  }
  default: {
    throw new Error(`unknown operator: ${binaryExpression.operator}`);
  }
  }
};

// evaluate a given vector expression
//
// identifierMap contains the values of input variables
const evalVector = (vectorExpression, identifierMap) => {
  const index = vectorExpression.identifiers.reduce((acc, id, idx) => {
    return acc + (identifierMap.get(id) ? Math.pow(2, idx) : 0);
  }, 0);

  return vectorExpression.values.get(index);
};

// evalute a given unary Expression
//
// identifierMap contains the values of input variables
// evalExpr is function to be used to evaluate sub expressions
const evalUnary = (unaryExpression, identifierMap, evalExpr) => {
  switch (unaryExpression.operator) {
  case 'NOT':
    const v = evalExpr(unaryExpression.operand, identifierMap);
    return evalNOT(v);
  default:
    throw new Error(`unknown operator: ${unaryExpression.operator}`);
  }
};

// evaluate an expression for given input values
// by evaluating it's sub expression recursively
//
// identifierMap contains the values of input variables
const doEvaluateExpression = (expression, identifierMap) => {
  switch (expression._name) {
  case 'binary':
    return evalBinary(expression, identifierMap,
      evaluateExpression
    );
  case 'unary':
    return evalUnary(expression, identifierMap,
      evaluateExpression
    );
  case 'group':
    return evaluateExpression(expression.body, identifierMap,
      evaluateExpression
    );
  case 'identifier':
    return identifierMap.get(expression);
  case 'vector':
    return evalVector(expression,identifierMap);
  case 'constant':
    return expression.value;
  case 'label':
    return evaluateExpression(expression.body, identifierMap);
  default:
    throw new Error(`unknown node: ${expression._name}`);
  }
};

// evaluate an expression for given input values
//
// identifierMap contains the values of input variables
export const evaluateExpression = (expression, identifierMap) => {
  if (expression === null) {
    return null;
  } else if (identifierMap.has(expression)) {
    return identifierMap.get(expression);
  } else {
    return doEvaluateExpression(expression, identifierMap);
  }
};

// create a map from identifiers to their valus
// given the index of the function table
// index is an integer. Each index results in a different combination
// of identifier values
const makeIdentifierMap = (identifiers, index) =>
  I.OrderedMap(identifiers.map(
    (id, i) => [id, !!(Math.pow(2, i) & index)]
  ))
;

export const evaluator = (identifierMap, expr) => {
  const val = evaluateExpression(expr, identifierMap);
  if (expr._name === 'label') {
    const newMap = identifierMap
      .set(expr.body, val)
      .set(expr, val);
    if (expr.name !== null) {
      return newMap
        .set(identifierExpression({name: expr.name}), val);
    } else {
      return newMap;
    }
  } else {
    return identifierMap.set(expr, val);
  }
}
;

// evaluate a list of expressions for a single input configuration
// returns the list of values for the expressions in the same order
// in which the expression are given.
export const evaluateSingle = ({
  expressions, identifierMap,
}) => {
  return expressions.reduce(evaluator, identifierMap);
};

// evaluates a list of expressions for all possible combinations of
// input values for the given identifiers.
export const evaluateAll = ({
  expressions, identifiers,
}) => {
  let mutCounter = Math.pow(2, identifiers.size) - 1;
  let mutAcc = I.List();
  while (mutCounter >= 0) {
    const identifierMap = makeIdentifierMap(
      identifiers, mutCounter
    ).asMutable();
    const resultMap = evaluateSingle({
      expressions, identifierMap,
    }).asImmutable();

    mutAcc = mutAcc.push(row({
      identifierValues: identifierMap,
      values: expressions.map(::resultMap.get),
    }));

    mutCounter--;
  }

  return mutAcc.reverse();
};
