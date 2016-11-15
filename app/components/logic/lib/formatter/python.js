const operators = {
  AND: 'and',
  OR: 'or',
  XOR: 'xor',
  NOT: 'not',
};

const tryFetch = (map, key) =>
  map[key] || key
;

const whitspace = new RegExp('\s+', 'g');
const sanitizeName = (name) =>
  name.replace(whitspace, '_');

const formatter = {
  name: "Python",
  formatBinary: (op, lhs, rhs/*, depth*/) => {
    return formatter.formatBinaryChain(op, lhs, rhs);
  },
  formatBinaryChain: (op, ...operands) => {
    return `(${operands.join(` ${tryFetch(operators, op)} `)})`;
  },
  formatUnary: (op, content/*, depth*/) => {
    return `(${formatter.formatUnarySimple(op, content)})`;
  },
  formatUnarySimple: (op, content/*, depth*/) => {
    return `${tryFetch(operators, op)} ${content}`;
  },
  formatGroup: (content/*, depth*/) => {
    return content;
  },
  formatName: (name) => {
    return sanitizeName(name);
  },
  formatValue: (value) => {
    if (value === true) {
      return 'True';
    } else if (value === false) {
      return 'False';
    } else {
      return 'None';
    }
  },
  formatVector: (identifiers, values) => {
    return `<${
      identifiers.map((i) => i.name).join(',')
    }:${
      values.map(formatter.formatVectorValue).join('')
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
  binaryOperator: (op) => tryFetch(operators, op),
  unaryOperator: (op) => tryFetch(operators, op),
};

export default formatter;
