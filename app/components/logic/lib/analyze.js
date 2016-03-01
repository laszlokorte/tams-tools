import I from 'immutable';

export const collectSubExpressions = (
  expression, acc = I.OrderedSet(), collect = false
) => {
  const newAcc = collect === true ? acc.add(expression) : acc;

  switch (expression._name) {
  case 'binary':
    return collectSubExpressions(expression.lhs, newAcc, true)
      .concat(collectSubExpressions(expression.rhs, newAcc, true));
  case 'unary':
    return collectSubExpressions(expression.operand, newAcc, true);
  case 'group':
    return collectSubExpressions(expression.body, acc, collect);
  case 'identifier':
    return acc;
  case 'constant':
    return acc;
  case 'vector':
    return newAcc;
  default:
    throw new Error(`unknown node: ${expression._name}`);
  }
};

export const collectIdentifiers = (expression, acc = I.Set()) => {
  if (expression === null) {
    return acc;
  }
  switch (expression._name) {
  case 'binary':
    return collectIdentifiers(expression.lhs, acc).union(
      collectIdentifiers(expression.rhs, acc)
    );
  case 'unary':
    return collectIdentifiers(expression.operand, acc);
  case 'group':
    return collectIdentifiers(expression.body, acc);
  case 'identifier':
    return acc.add(expression);
  case 'constant':
    return acc;
  case 'vector':
    return acc.union(expression.identifiers);
  default:
    throw new Error(`unknown node: ${expression._name}`);
  }
};
