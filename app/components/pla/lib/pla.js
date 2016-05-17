import I from 'immutable';

// object representing one loop in a Karnaugh map
const loop = I.Record({
  // the input values.
  // A list of true|false|null values
  in: I.List(),
  // The output values
  // (on loop can belong to more than one output)
  // List of true|false
  out: I.List(),
  // The color of the loop (css color)
  color: null,
  // If the loop should be highlighted
  highlight: false,
}, 'plaLoop');

// object representing PLA data extracted from a Karnaugh map
export const pla = I.Record({
  mode: null, // "knf" or "dnf"
  inputs: I.List(), // List of input names (strings)
  outputs: I.List(), // List of output names (strings)
  // list of loops
  // (All loops are assumed to have the same number of
  // inputs and the same number of outputs)
  loops: I.List(),
}, 'pla');

// create an immutable pla object from a plain js object
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
