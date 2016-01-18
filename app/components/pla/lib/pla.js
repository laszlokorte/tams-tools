import I from 'immutable';

const loop = I.Record({
  in: I.List(),
  out: I.List(),
  color: null,
  highlight: false,
}, 'plaLoop');

export const pla = I.Record({
  mode: null,
  inputs: I.List(),
  outputs: I.List(),
  loops: I.List(),
}, 'pla');

export const plaFromJson = (object) => {
  return pla({
    mode: object.mode,
    inputs: I.List(object.inputs.map((name) => name.toString())),
    outputs: I.List(object.outputs.map((name) => name.toString())),
    loops: I.List(object.loops.map((l) => loop({
      in: I.List(l.in),
      out: I.List(l.out),
      color: l.color,
      highlight: l.highlight,
    }))),
  });
};
