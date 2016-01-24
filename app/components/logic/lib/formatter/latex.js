const operators = {
  AND: '\\wedge',
  OR: '\\oplus',
  NOT: '\\neg',
  XOR: '\\oplus',
};

const tryFetch = (map, key) =>
  map[key] || key
;

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
    return name;
  },
  formatValue: (value) => {
    return value ? '\\top' : '\\bot';
  },
};
