const greenColor = '#00cc00';
const redColor = '#cc0000';
const cyanColor = '#00dddd';

const children = (expression) => {
  switch (expression._name) {
  case 'binary':
    return [expression.lhs, expression.rhs];
  case 'unary':
    return [expression.operand];
  case 'group':
  case 'label':
    return [expression.body];
  case 'identifier':
  case 'constant':
    return [];
  case 'vector':
    return expression.identifiers;
  default:
    throw new Error(`unknown node: ${expression._name}`);
  }
};

const constantName = (expression) => {
  if (expression.value === null) {
    return '*';
  }
  return expression.value ? '1' : '0';
};

const name = (expression) => {
  switch (expression._name) {
  case 'binary':
    return expression.operator.toString();
  case 'unary':
    return expression.operator.toString();
  case 'group':
    return "(...)";
  case 'label':
    return `${expression.name} = `;
  case 'identifier':
    return expression.name.toString();
  case 'constant':
    return constantName(expression);
  case 'vector':
    return '<Vector:...>';
  default:
    throw new Error(`unknown node: ${expression._name}`);
  }
};

const constantColor = (expression) => {
  if (expression.value === null) {
    return cyanColor;
  }
  return expression.value ? greenColor : redColor;
};

const expressionColor = (expression, evalutationMap) => {
  const value = evalutationMap.get(expression);
  if (value === null) {
    return cyanColor;
  }
  return value ? greenColor : redColor;
};

const color = (expression, evalutationMap) => {
  switch (expression._name) {
  case 'binary':
  case 'unary':
  case 'group':
  case 'identifier':
  case 'vector':
    return expressionColor(expression, evalutationMap);
  case 'label':
    return color(expression.body, evalutationMap);
  case 'constant':
    return constantColor(expression);
  default:
    throw new Error(`unknown node: ${expression._name}`);
  }
};

const toTree = (expression, evalutationMap) => {
  if (expression === null) {
    return null;
  }

  if (expression._name === 'group') {
    return toTree(expression.body, evalutationMap);
  } else if (expression._name === 'label' && expression.name === null) {
    return toTree(expression.body, evalutationMap);
  }

  return {
    name: name(expression),
    children: children(expression).map((e) => toTree(e, evalutationMap)),
    color: evalutationMap && color(expression, evalutationMap),
  };
};

export default toTree;
