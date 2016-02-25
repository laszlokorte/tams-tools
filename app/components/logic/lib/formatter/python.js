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

const valueToString = (value) => {
  if (value === true) {
    return '1';
  } else if (value === false) {
    return '0';
  } else {
    return '*';
  }
};

export default {
  formatBinary: (op, lhs, rhs/*, depth*/) => {
    return `(${lhs} ${tryFetch(operators, op)} ${rhs})`;
  },
  formatUnary: (op, content/*, depth*/) => {
    return `(${tryFetch(operators, op)} ${content})`;
  },
  formatGroup: (content/*, depth*/) => {
    return content;
  },
  formatName: (name) => {
    return sanitizeName(name);
  },
  formatValue: (value) => {
    return value ? 'true' : 'false';
  },
  formatVector: (identifiers, values) => {
    return `<${
      identifiers.map((i) => sanitizeName(i.name)).join(',')
    }:${
      values.map(valueToString).join('')
    }>`;
  },
  formatVectorValue: valueToString,
};
