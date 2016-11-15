// the interface for a formatter object
// a formatter needs to provide the following methods in order
// to be used for formatting an expression
const defaultFormatter = {
  // format a binary expression
  //
  // op is the name of the operator: 'AND' | 'OR' | 'XOR'
  // lhs and rhs are the left and right hand side already
  // converted into a string
  formatBinary: (op, lhs, rhs/*, depth*/) => {
    return defaultFormatter.formatBinaryChain(op, lhs, rhs);
  },
  // join multiple operands with a binary operator
  //
  // op is the name of the operator: 'AND' | 'OR' | 'XOR'
  // operands is a list of strings
  formatBinaryChain: (op, ...operands) => {
    return `(${operands.join(' ' + op + ' ')})`;
  },
  // format a unary expression
  //
  // op is the name of the operator: 'NOT'
  // body is the sub expression as string
  formatUnary: (op, body/*, depth*/) => {
    return `(${op} ${body})`;
  },
  // format a unary expression without wrapping
  // it in parenthesis
  //
  // op is the name of the operator: 'NOT'
  // body is the sub expression as string
  formatUnarySimple: (op, content/*, depth*/) => {
    return defaultFormatter.formatUnary(op, content);
  },
  // format a group expression
  //
  // body is the sub expression as string
  formatGroup: (body/*, depth*/) => {
    return body;
  },
  // format the name of an identifier (string)
  formatName: (name) => {
    return name;
  },
  // format a constant value: true | false | null
  formatValue: (value) => {
    return value;
  },
  // format a vector of values
  formatVector: (identifiers, values) => {
    return `<${
      identifiers.map((i) => i.name).join(',')
    }:${
      values.map(defaultFormatter.formatVectorValue).join('')
    }>`;
  },
  // format a single vector value
  formatVectorValue: (value) => {
    if (value === true) {
      return '1';
    } else if (value === false) {
      return '0';
    } else {
      return '*';
    }
  },
  // format a labeled expression
  // name is the label as string
  // body is the sub expression as string
  formatLabel: (name, body) => {
    return `${name}=${body}`;
  },
  // format a list of expressions
  // expressions is an array of strings
  formatExpressions: (expressions) => {
    return expressions.join(', ');
  },

  binaryOperator: (op) => op,
  unaryOperator: (op) => op,
};

// convert an expression into a string using the given formatter
export const expressionToString = (
  expression, formatter = defaultFormatter, depth = 0
) => {
  if (expression === null) {
    return '';
  }

  switch (expression._name) {
  case 'binary':
    return formatter.formatBinary(
      expression.operator,
      expressionToString(expression.lhs, formatter, depth + 1),
      expressionToString(expression.rhs, formatter, depth + 1),
      depth
    );
  case 'unary':
    return formatter.formatUnary(
      expression.operator,
      expressionToString(expression.operand, formatter, depth + 1),
      depth
    );
  case 'group':
    const contentString = expressionToString(
      expression.body, formatter, depth + 1
    );
    return formatter.formatGroup(contentString, depth);
  case 'identifier':
    return formatter.formatName(expression.name);
  case 'constant':
    return formatter.formatValue(expression.value);
  case 'vector':
    return formatter.formatVector(
      expression.identifiers, expression.values
    );
  default:
    throw new Error(`unknown node: ${expression._name}`);
  }
};

// Convert a list of expressions into a string using
// the given formatter
export const expressionListToString = (
  expressionList, formatter = defaultFormatter
) =>
  formatter.formatExpressions(expressionList.map(
    (e) => e.name !== null ?
      formatter.formatLabel(
        formatter.formatName(e.name),
        expressionToString(e.body, formatter)
      ) : expressionToString(e.body, formatter)
  ))
;
