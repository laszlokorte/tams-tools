
const defaultFormatter = {
  formatBinary: (op, lhs, rhs/*, depth*/) => {
    return defaultFormatter.formatBinaryChain(op, lhs, rhs);
  },
  formatBinaryChain: (op, ...operands) => {
    return `(${operands.join(' ' + op + ' ')})`;
  },
  formatUnary: (op, content/*, depth*/) => {
    return `(${op} ${content})`;
  },
  formatUnarySimple: (op, content/*, depth*/) => {
    return defaultFormatter.formatUnary(op, content);
  },
  formatGroup: (content/*, depth*/) => {
    return content;
  },
  formatName: (name) => {
    return name;
  },
  formatValue: (value) => {
    return value;
  },
  formatVector: (identifiers, values) => {
    return `<${
      identifiers.map((i) => i.name).join(',')
    }:${
      values.map(defaultFormatter.formatVectorValue).join('')
    }>`;
  },
  formatVectorValue: (value) => {
    if (value === true) {
      return '1';
    } else if (value === false) {
      return '0';
    } else {
      return '*';
    }
  },
  formatLabel: (name, body) => {
    return `${name}=${body}`;
  },
  formatExpressions: (expressions) => {
    return expressions.join(', ');
  },
};

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
