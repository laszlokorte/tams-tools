const operators = {
  AND: '&&',
  OR: '||',
  NOT: '!',
  XOR: '^',
};

const tryFetch = (map, key) =>
  map[key] || key
;

const whitspace = new RegExp('\s+', 'g');
const sanitizeName = (name) =>
  name.replace(whitspace, '_');

export default {
  formatBinary: (op, lhs, rhs/*, depth*/) => {
    return `(${lhs} ${tryFetch(operators, op)} ${rhs})`;
  },
  formatUnary: (op, content/*, depth*/) => {
    return `(${tryFetch(operators, op)}${content})`;
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
    return "[VECTOR]";
  },
  formatVector: (identifiers, values) => {
    return `[${
      identifiers.map((i) => sanitizeName(i.name)).join(',')
    }:${
      values.map((v) => v ? '1' : '0').join('')
    }]`;
  },
};
