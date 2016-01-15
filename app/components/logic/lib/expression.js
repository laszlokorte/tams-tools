import I from 'immutable';

const row = I.Record({
  identifierValues: I.Map(),
  values: I.List(),
});

const expressionUnion = I.Record({
  node: null,
  operator: null,
  operand: null,
  lhs: null,
  rhs: null,
  content: null,
  name: null,
  style: null,
  value: null,
});

export const expressionFromJson = (data) => {
  if (data === null) {
    return null;
  }
  switch (data.node) {
  case 'binary':
    return expressionUnion({
      node: data.node.toString(),
      operator: data.operator.toString(),
      lhs: expressionFromJson(data.lhs),
      rhs: expressionFromJson(data.rhs),
    });
  case 'unary':
    return expressionUnion({
      node: data.node.toString(),
      operator: data.operator.toString(),
      operand: expressionFromJson(data.operand),
    });
  case 'group':
    return expressionUnion({
      node: data.node.toString(),
      content: expressionFromJson(data.content),
      style: data.style,
    });
  case 'identifier':
    return expressionUnion({
      node: data.node.toString(),
      name: data.name.toString(),
    });
  case 'constant':
    return expressionUnion({
      node: data.node.toString(),
      value: data.value,
    });
  default:
    throw new Error(`unknown node: ${data}`);
  }
};

export const evalBinary = (expression, identifierMap, evalExpr) => {
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

export const evalUnary = (expression, identifierMap, evalExpr) => {
  switch (expression.operator) {
  case 'NOT':
    return !evalExpr(expression.operand, identifierMap);
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
    return !!identifierMap.get(expression.name);
  case 'constant':
    return expression.value;
  default:
    throw new Error(`unknown node: ${expression.node}`);
  }
};

export const evaluateAll = ({
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

export const collectSubExpressions = (
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
    return collectSubExpressions(expression.content, acc, true);
  case 'identifier':
    return acc;
  case 'constant':
    return acc;
  default:
    throw new Error(`unknown node: ${expression.node}`);
  }
};

export const collectIdentifiers = (expression, acc = I.Set()) => {
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
