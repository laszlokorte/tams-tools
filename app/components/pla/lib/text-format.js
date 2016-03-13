const valueToString = (value) => {
  if (value === 1 || value === 0) {
    return value;
  } else {
    return '-';
  }
};

export default (pla) => {
  return [
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
