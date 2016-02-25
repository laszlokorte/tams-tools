const greenColor = '#00cc00';
const redColor = '#cc0000';
const cyanColor = '#00dddd';

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
  case 'vector':
    return expression.vectorIdentifiers;
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
    if (expression.value === null) {
      return '*';
    }
    return expression.value ? '1' : '0';
  case 'vector':
    return 'Vector[...]';
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
  case 'vector':
    const value = evalutationMap.get(expression);
    if (value === null) {
      return cyanColor;
    }
    return value ? greenColor : redColor;
  case 'constant':
    if (expression.value === null) {
      return cyanColor;
    }
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
  } else if (expression._name === 'labeledExpression') {
    if (expression.name === null) {
      return toTree(expression.content, evalutationMap);
    } else {
      return {
        name: expression.name.toString() + ' =',
        children: [toTree(expression.content, evalutationMap)],
        color: evalutationMap && color(expression.content, evalutationMap),
      };
    }
  }

  return {
    name: name(expression),
    children: children(expression).map((e) => toTree(e, evalutationMap)),
    color: evalutationMap && color(expression, evalutationMap),
  };
};

export default toTree;
