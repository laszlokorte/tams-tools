const terms = (formatter, disjunctive, loops, inputNames) => {
  // each loop becomes a clause
  const clauses = loops.map((loop) => {
    const term = inputNames
      .map(::formatter.formatName)
      // each input value is transformed in either
      // the input name or it's negation or null
      // depending on if a disjunctive or a konjunctive
      // term is built
      .map((name,i) => {
        const v = loop.in[i];

        if (v === disjunctive) {
          return `${name}`;
        } else if (v === !disjunctive) {
          return formatter.formatUnarySimple('NOT', name);
        } else {
          return null;
        }
      })
      // input's with a null value are omitted
      .filter((name) => name !== null);

    // if a term is empty it get's replaced with
    // a constant Top or Bottom
    // otherwise it get's join via AND or OR conjunction
    // depending on the DNF/KNF mode
    return term.length === 0 ?
      formatter.formatValue(disjunctive) :
      formatter.formatBinaryChain(disjunctive ? 'AND' : 'OR', ...term);
  });

  return clauses.length === 0 ?
    formatter.formatValue(!disjunctive) :
    formatter.formatBinaryChain(disjunctive ? 'OR' : 'AND', ...clauses);
};

const build = (disjunctive, pla, formatter) => {
  return formatter.formatExpressions(
    // each output becomes a separate expression
    pla.outputs.map((name, idx) =>
      formatter.formatLabel(
        formatter.formatName(name.toString()),
        terms(
          formatter,
          disjunctive,
          pla.loops.filter((l) => l.out[idx]),
          pla.inputs
        )
      )
  ));
};

// Convert a pla into an expression (string)
// using the given formatter
// returns either a DNF or KNF expression depending on the pla
export default (formatter, pla) => {
  if (pla.mode === 'knf') {
    return build(false, pla, formatter);
  } else if (pla.mode === 'dnf') {
    return build(true, pla, formatter);
  } else {
    return '?';
  }
};
