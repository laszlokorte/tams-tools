const children = (expression) => {
  switch (expression.node) {
  case 'binary':
    return [expression.lhs, expression.rhs];
  case 'unary':
    return [expression.operand];
  case 'group':
    return [expression.content];
  case 'identifier':
  case 'constant':
    return [];
  default:
    throw new Error(`unknown node: ${expression.node}`);
  }
};

const name = (expression) => {
  switch (expression.node) {
  case 'binary':
    return expression.operator.toString();
  case 'unary':
    return expression.operator.toString();
  case 'group':
    return "(...)";
  case 'identifier':
    return expression.name.toString();
  case 'constant':
    return expression.value.toString();
  default:
    throw new Error(`unknown node: ${expression.node}`);
  }
};

const toTree = (expression) => {
  if (expression === null) {
    return null;
  }

  if (expression.node === 'group') {
    return toTree(expression.content);
  }

  return {
    name: name(expression),
    children: children(expression).map(toTree),
  };
};

export default toTree;
