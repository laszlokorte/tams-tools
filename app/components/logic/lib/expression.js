import I from 'immutable';

const labeledExpression = I.Record({
  location: null,
  name: null,
  content: null,
}, 'labeledExpression');

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
  vectorIdentifiers: null,
  vectorValues: null,
}, 'expressionUnion');

export const expressionFromJson = (data) => {
  if (data === null) {
    return null;
  }

  switch (data.node) {
  case 'label':
    return labeledExpression({
      location: data.location,
      name: data.name,
      content: expressionFromJson(data.content),
    });
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
  case 'vector':
    return expressionUnion({
      node: data.node.toString(),
      vectorIdentifiers: data.vector.identifiers.map(expressionFromJson),
      vectorValues: I.List(data.vector.values),
    });
  default:
    throw new Error(`unknown node: ${data}`);
  }
};
