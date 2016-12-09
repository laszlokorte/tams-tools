// node colors
// TODO(Laszlo Korte): move color defintions to css
//
// color for expressions that evaluate to true
const trueColor = '#00cc00';
// color for expressions that evaluate to false
const falseColor = '#cc0000';
// color for expressions that evaluate to null / dont-care
const nullColor = '#00dddd';

// get the child expression of a given expression
// to be used as child nodes in the tree
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

// get the tree node's label for a given constant expression
const constantName = (expression) => {
  if (expression.value === null) {
    return '*';
  }
  return expression.value ? '1' : '0';
};

// get the tree node's label for a given expression
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

const formattedName = (expression, formatter) => {
  switch (expression._name) {
  case 'binary':
    return formatter.binaryOperator(expression.operator.toString());
  case 'unary':
    return formatter.unaryOperator(expression.operator.toString());
  case 'group':
    return "(...)";
  case 'label':
    return formatter.label(expression.name.toString());
  case 'identifier':
    return formatter.formatName(expression.name.toString());
  case 'constant':
    return formatter.formatValue(expression.value);
  case 'vector':
    return '<Vector:...>';
  default:
    throw new Error(`unknown node: ${expression._name}`);
  }
};

// get the color of a constant expression
const constantColor = (expression) => {
  if (expression.value === null) {
    return nullColor;
  }
  return expression.value ? trueColor : falseColor;
};

// get the color for the given expression
// by looking up it's value in the evaluation map
const expressionColor = (expression, evalutationMap) => {
  const value = evalutationMap.get(expression);
  if (value === null) {
    return nullColor;
  }
  return value ? trueColor : falseColor;
};

// get the color for the given expression
// by looking up it's value in the evaluation map
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

// build an expression tree
const toTree = (expression, formatter, evalutationMap = null) => {
  // skip group expressions
  if (expression._name === 'group') {
    return toTree(expression.body, formatter, evalutationMap);
  }

  return {
    name: name(expression),
    formattedName: formattedName(expression, formatter),
    children: children(expression).map(
      (e) => toTree(e, formatter, evalutationMap)
    ),
    // color the node if an evaluation mal is available
    color: evalutationMap && color(expression, evalutationMap),
  };
};

// build an operator tree of the given expression
// to be displayed via the tree component
// use the evalutaionMap to color the nodes
export default (expression, formatter, evalutationMap = null) => {
  // if the expression is a label but has no name set
  // skip it and only use the sub expression
  if (expression._name === 'label' && expression.name === null) {
    return toTree(expression.body, formatter, evalutationMap);
  } else {
    return toTree(expression.body, formatter, evalutationMap);
  }
};
