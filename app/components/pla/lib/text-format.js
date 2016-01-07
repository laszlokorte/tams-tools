// const text =
// `.i 4
// .innames a b c d
// .o 2
// .outnames x y
// .p11
// 0000 10
// 0001 10
// 0010 11
// --11 01
// .e
// `;

const x = null;

const json = {
  inputs: ['a','b','c','d','a','b','c','d'],
  outputs: ['x','y','x','y'],
  loops: [
    {in: [0,0,1,0,0,0,1,0], out: [1,0,1,0]},
    {in: [1,1,1,1,1,1,1,1], out: [1,0,1,0]},
    {in: [x,x,x,1,x,x,x,1], out: [1,1,1,1]},
    {in: [0,x,1,1,0,x,1,1], out: [0,1,0,1]},
    {in: [0,1,0,0,0,1,0,0], out: [0,1,0,1]},
    {in: [0,1,0,0,0,1,0,0], out: [0,1,0,1]},
    {in: [0,0,1,0,0,0,1,0], out: [1,0,1,0]},
    {in: [1,1,1,1,1,1,1,1], out: [1,0,1,0]},
    {in: [x,x,x,1,x,x,x,1], out: [1,1,1,1]},
    {in: [0,x,1,1,0,x,1,1], out: [0,1,0,1]},
    {in: [0,1,0,0,0,1,0,0], out: [0,1,0,1]},
    {in: [0,1,0,0,0,1,0,0], out: [0,1,0,1]},
    {in: [0,0,1,0,0,0,1,0], out: [1,0,1,0]},
    {in: [1,1,1,1,1,1,1,1], out: [1,0,1,0]},
    {in: [x,x,x,1,x,x,x,1], out: [1,1,1,1]},
    {in: [0,x,1,1,0,x,1,1], out: [0,1,0,1]},
    {in: [0,1,0,0,0,1,0,0], out: [0,1,0,1]},
    {in: [0,1,0,0,0,1,0,0], out: [0,1,0,1]},
  ],
};

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

export const example = json;
