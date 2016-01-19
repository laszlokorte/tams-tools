const greenColor = '#00cc00';
const redColor = '#cc0000';

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
    return expression.value ? '1' : '0';
  default:
    throw new Error(`unknown node: ${expression.node}`);
  }
};

const color = (expression, evalutationMap) => {
  switch (expression.node) {
  case 'binary':
  case 'unary':
  case 'group':
  case 'identifier':
    return evalutationMap.get(expression) ? greenColor : redColor;
  case 'constant':
    return expression.value ? greenColor : redColor;
  default:
    throw new Error(`unknown node: ${expression.node}`);
  }
};

const toTree = (expression, evalutationMap) => {
  if (expression === null) {
    return null;
  }

  if (expression.node === 'group') {
    return toTree(expression.content, evalutationMap);
  }

  return {
    name: name(expression),
    children: children(expression).map((e) => toTree(e, evalutationMap)),
    color: evalutationMap && color(expression, evalutationMap),
  };
};

export default toTree;
