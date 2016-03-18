const valueToString = (value) => {
  if (value === true || value === false) {
    return value ? '1' : '0';
  } else {
    return '-';
  }
};

// Convert a pla into a BLIF string format
// https://www.ece.cmu.edu/~ee760/760docs/blif.pdf
export default (pla) => {
  return [
    `# ${pla.mode}`,
    `.i ${pla.inputs.length}`,
    `.innames ${pla.inputs.join(' ')}`,
    `.o ${pla.outputs.length}`,
    `.outnames ${pla.outputs.join(' ')}`,
    `.p${pla.loops.length}`,
    pla.loops.map((loop) =>
      loop.in.map(valueToString).join('') +
      ' ' +
      loop.out.map(valueToString).join('')
    ).join('\n'),
    `.e`,
  ].join('\n');
};
