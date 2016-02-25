const operators = {
  AND: '∧',
  OR: '∨',
  XOR: '⊕',
  NOT: '¬',
};

const tryFetch = (map, key) =>
  map[key] || key
;

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
    return name;
  },
  formatValue: (value) => {
    if (value === true) {
      return '⊤';
    } else if (value === false) {
      return '⊥';
    } else {
      return 'Ø';
    }
  },
  formatVector: (identifiers, values) => {
    return `<${
      identifiers.map((i) => i.name).join(',')
    }:${
      values.map(this.valueToString).join('')
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
};
