const nf = (formatter, disjunctive, loops, inputNames) => {
  const terms = loops.map((loop) => {
    const parts = inputNames
      .map(::formatter.formatName)
      .map((name,i) => {
        const v = loop.in[i];

        if (v === disjunctive) {
          return `${name}`;
        } else if (v === !disjunctive) {
          return formatter.formatUnarySimple('NOT', name);
        } else {
          return void 0;
        }
      })
      .filter((name) => name !== void 0);

    return parts.length === 0 ?
      formatter.formatValue(disjunctive) :
      formatter.formatBinaryChain(disjunctive ? 'AND' : 'OR', ...parts);
  });

  return terms.length === 0 ?
    formatter.formatValue(!disjunctive) :
    formatter.formatBinaryChain(disjunctive ? 'OR' : 'AND', ...terms);
};

const build = (disjunctive, pla, formatter) => {
  return formatter.formatExpressions(
    pla.outputs.map((name, idx) =>
      formatter.formatLabel(
        formatter.formatName(name.toString()),
        nf(
          formatter,
          disjunctive,
          pla.loops.filter((l) => l.out[idx]),
          pla.inputs
        )
      )
  ));
};

export default (formatter, pla) => {
  if (pla.mode === 'knf') {
    return build(false, pla, formatter);
  } else if (pla.mode === 'dnf') {
    return build(true, pla, formatter);
  } else {
    return '?';
  }
};
