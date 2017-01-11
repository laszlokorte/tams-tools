import I from 'immutable';

// A labeled expression like
// X = (A & B)
// "X" is the label/name
// "(A & B)" is the body
// A labeled expression can only occure at the top level.
// It can not be a sub expression of other expression.
export const labelExpression = I.Record({
  location: null, // location in the input string that has been parsed
  name: null, // the expression's name
  body: null, // the expression's body / sub tree
}, 'label');

// a binary expression object
export const binaryExpression = I.Record({
  operator: null, // Name of the operator: "OR" | "AND" | "XOR"
  lhs: null, // left hand side sub expression
  rhs: null, // right hand side sub expression
}, 'binary');

// a unary expression object
export const unaryExpression = I.Record({
  operator: null, // Name of the operator: "NOT"
  operand: null, // sub expression
}, 'unary');

// a group expression object
export const groupExpression = I.Record({
  style: null, // the style of parenthesis/braces used to create the group
  body: null, // the sub expression the group contains
}, 'group');

// an identifier expression
export const identifierExpression = I.Record({
  name: null, // name of the identifier (string)
}, 'identifier');

// a constant expression
export const constantExpression = I.Record({
  value: null, // value of the constant : true | false | null
}, 'constant');

// a vector expression
export const vectorExpression = I.Record({
  identifiers: I.List(), // identifiers the vector references
  values: I.List(), // the list of values the vector contains:
                    // [true | false | null]
}, 'vector');

// create an immutable expression object from the given
// raw javascript object
// returns one of the expression objects declared above
export const expressionFromJson = (jsonData) => {
  switch (jsonData.node) {
  case 'label':
    return labelExpression({
      location: jsonData.location,
      name: jsonData.name,
      body: expressionFromJson(jsonData.body),
    });
  case 'binary':
    return binaryExpression({
      operator: jsonData.operator.toString(),
      lhs: expressionFromJson(jsonData.lhs),
      rhs: expressionFromJson(jsonData.rhs),
    });
  case 'unary':
    return unaryExpression({
      operator: jsonData.operator.toString(),
      operand: expressionFromJson(jsonData.operand),
    });
  case 'group':
    return groupExpression({
      body: expressionFromJson(jsonData.body),
      style: jsonData.style,
    });
  case 'identifier':
    return identifierExpression({
      name: jsonData.name.toString(),
    });
  case 'constant':
    return constantExpression({
      value: jsonData.value,
    });
  case 'vector':
    return vectorExpression({
      identifiers: jsonData.vector.identifiers.map(expressionFromJson),
      values: I.List(jsonData.vector.values),
    });
  default:
    throw new Error(`unknown node: ${jsonData}`);
  }
};
