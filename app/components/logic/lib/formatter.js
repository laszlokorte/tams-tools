
const defaultFormatter = {
  formatBinary: (op, lhs, rhs/*, depth*/) => {
    return `(${lhs} ${op} ${rhs})`;
  },
  formatUnary: (op, content/*, depth*/) => {
    return `(${op} ${content})`;
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
