import I from 'immutable';

const row = I.Record({
  identifierValues: I.Map(),
  values: I.List(),
});

const evalBinary = (expression, identifierMap, evalExpr) => {
  const lhs = evalExpr(expression.lhs, identifierMap);
  const rhs = evalExpr(expression.rhs, identifierMap);

  switch (expression.operator) {
  case 'AND': {
    return (lhs === false || rhs === false) ? false : lhs && rhs;
  }
  case 'OR': {
    return (lhs === null && rhs === false) ? null : lhs || rhs;
  }
  case 'XOR': {
    return (lhs === null || rhs === null) ? null : !lhs !== !rhs;
  }
  default: {
    throw new Error(`unknown operator: ${expression.operator}`);
  }
  }
};

const evalVector = (identifiers, values, identifierMap) => {
  const index = identifiers.reduce((acc, id, idx) => {
    return acc + (identifierMap.get(id) ? Math.pow(2, idx) : 0);
  }, 0);

  return values.get(index);
};

const evalUnary = (expression, identifierMap, evalExpr) => {
  switch (expression.operator) {
  case 'NOT':
    const v = evalExpr(expression.operand, identifierMap);
    return v === null ? null : !v;
  default:
    throw new Error(`unknown operator: ${expression.operator}`);
  }
};

export const evaluateExpression = (expression, identifierMap) => {
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
    return !!identifierMap.get(expression);
  case 'vector':
    return evalVector(
      expression.vectorIdentifiers, expression.vectorValues,
      identifierMap
    );
  case 'constant':
    return expression.value;
  default:
    throw new Error(`unknown node: ${expression.node}`);
  }
};

const makeIdentifierMap = (identifiers, counter) =>
  I.Map(identifiers.map(
    (name, i) => [name, !!(Math.pow(2, i) & counter)]
  ))
;

const makeEvaluator = (identifierMap) => (expr) =>
  evaluateExpression(expr, identifierMap)
;

export const evaluateAll = ({
  expressions, identifiers,
  acc = I.List(), counter = Math.pow(2, identifiers.size) - 1,
}) => {
  // if (counter < 0) {
  //   return acc.reverse();
  // } else {
  let mutCounter = counter;
  let mutAcc = acc;
  while (mutCounter >= 0) {
    const identifierMap = makeIdentifierMap(identifiers, mutCounter);
    const evaluator = makeEvaluator(identifierMap);

    mutAcc = mutAcc.push(row({
      identifierValues: identifierMap,
      values: expressions.map(evaluator).toList(),
    }));

    mutCounter--;
  }

  return mutAcc.reverse();
/*
    const identifierMap = I.Map(identifiers.map(
      (name, i) => [name, !!(Math.pow(2, i) & counter)]
    ));

    const newAcc = acc.push(row({
      identifierValues: identifierMap,
      values: expressions.map((expr) =>
        evaluateExpression(expr, identifierMap)
      ).toList(),
    }));

    return evaluateAll({
      expressions,
      identifiers,
      acc: newAcc,
      counter: counter - 1,
    });
  }
    */
};
