import I from 'immutable';

import bounds from '../../graphics/lib/bounds';

const PORT_DISTANCE = 10;
const LABEL_OFFSET = 15;

// The direction in which the output
// port of a gate is pointing
export const Rotation = {
  NORTH: 0,
  EAST: 1,
  SOUTH: 2,
  WEST: 3,
};

// object representing a circuit layout
const layout = I.Record({
  gates: I.List(), // the gates of the circuit
  wires: I.List(), // the wires of the circuit
  labels: I.List(), // the labels of the circuit
  bounds: bounds(), // bounding box of th circuit
}, 'plaLayout');

// object representing a 2D catersian position
const position = I.Record({
  x: 0,
  y: 0,
}, 'plaPosition');

// object representing a logic gate
const gate = I.Record({
  // type of the gate:
  // 'or' | 'xor' | 'and' |
  // 'nor' | 'xnor' | 'nand' |
  // 'not'
  type: null,
  // center position of the gate
  center: position(),
  // number of input ports
  inputCount: 0,
  // rotation of the gate, direction of output port
  rotation: Rotation.NORTH,
  // if a soder dot should be visible at the output port
  soderOutput: false,
  // if soder dots should be visible at the input port
  soderInput: false,
  // if the gate is allowed to be omitted.
  // eg if a gate has only one or no inputs it can be replaced with
  // a direct connection
  mayOmit: false,
  // the color of the gate (a valid css color)
  color: null,
  // if the gate should be highlighted
  highlight: null,
}, 'plaGate');

// object representing a streight wire
const wire = I.Record({
  // direction of the wire.
  // either 'horizontal' or 'vertical'
  type: 'horizontal',
  // start point of the wire
  from: position(),
  // the x coordinate of the end of the wire
  // (only used for horizontal wires)
  toX: 0,
  // the y coordinate of the end of the wire
  // (only used for vertical wires)
  toY: 0,
  // the index of the input of a gates to which the wire
  // is connected.
  // Is is used to offset the wire position slightly to match the
  // position of the port of the gate
  input: 0,
  // The number of inputs the gate to which the wire is connected has.
  // Is is used to offset the wire position slightly to match the
  // position of the port of the gate
  inputCount: 1,
  // If a soder dot should be visible at the start of the wire
  soderStart: false,
  // If a soder dot should be visible at the end of the wire
  soderEnd: false,
}, 'plaWire');

// object representing a text label
const label = I.Record({
  // The text
  text: '',
  // the position of the text
  anchor: position(),
  // the alignment of the text relative to it's position
  // start | middle | end
  align: 'middle',
}, 'plaLabel');

// Calculate the layout for the given input ports
// inputs is a list of input port names
// height is the total height of the circuit
//
// returns an object {height, width, labels, gates, wires}
// height is the vertical space input ports occupy
// width is the horizontal space the input ports occupy
// labels are the text label objects containing the inputs' names
// gates are the gate objects for the input ports
// wires are the wire objects for the input ports
const layoutInputs = (inputs, height) => {
  return {
    height: 25,
    width: 12 + PORT_DISTANCE * inputs.size,
    // each input gets one text label with it's name
    labels: inputs.map((name, index) => label({
      text: name,
      anchor: position({x: -PORT_DISTANCE * index - 18, y: -23}),
      align: 'start',
    })),
    // Each input gets one inverter gate to provide
    // the inverted input
    gates: inputs.map((name, index) => gate({
      type: 'inverter',
      center: position({
        x: -PORT_DISTANCE * index - LABEL_OFFSET,
        y: -LABEL_OFFSET,
      }),
      inputCount: 1,
      rotation: Rotation.SOUTH,
    })),
    // Each input gets two vertical wires.
    // One for the input itself and one for the inverted value.
    // Additionaly one short horizontal wire connects the input
    // with in inverter
    wires: inputs.reduce((acc,name, index) => acc.push(
      wire({
        type: 'vertical',
        from: position({x: -PORT_DISTANCE * index - 19, y: -23}),
        toY: height - 5,
        input: 0,
        inputCount: 1,
        soderStart: true,
      }),
      wire({
        type: 'vertical',
        from: position({x: -PORT_DISTANCE * index - 15, y: -15 + 5}),
        toY: height - 5,
        input: 0,
        inputCount: 1,
      }),
      wire({
        type: 'horizontal',
        from: position({x: -PORT_DISTANCE * index - 19, y: -15 - 5}),
        toX: -PORT_DISTANCE * index - 15,
        input: 0,
        inputCount: 1,
        soderStart: true,
      })
    ), I.List())
    ,
  };
};

// calculate the layout of the output gates
// for the given pla.
// outputGateWidth is the widht of the largest output gate
//
// returns an object {width, labels, gates, wires}
// width is the horizontal space the output ports occupy
// labels are the text label objects containing the outputs' names
// gates are the gate objects for the output ports
// wires are the wire objects for the output ports
const layoutOutputs = (pla, outputGateWidth) => {
  const gateWidth = (2 + Math.max(7, pla.inputs.size));
  const outputWireCount = pla.outputs.map(
    (_, index) => pla.loops
      .filter((loop) =>
        loop.out.get(index) === true
      ).count()
    )
  ;

  return {
    width: 17 + outputGateWidth * pla.outputs.size,
    labels: pla.outputs.map((name, index) => label({
      text: name,
      anchor: position({
        x: outputGateWidth * index + outputGateWidth / 2 + LABEL_OFFSET,
        y: -22,
      }),
      align: 'middle',
    })),
    gates: pla.outputs.map((name, index) => gate({
      type: pla.mode === 'dnf' ? 'or' : 'and',
      center: position({
        x: outputGateWidth * index + outputGateWidth / 2 + LABEL_OFFSET,
        y: -LABEL_OFFSET,
      }),
      inputCount: outputWireCount.get(index),
      rotation: Rotation.NORTH,
      soderOutput: true,
      mayOmit: true,
    })),
    wires: pla.outputs.reduce((acc, _, index) =>
      pla.loops
        .map((loop, idx) => ({idx, loop}))
        .filter(({loop}) => loop.out.get(index) === true)
        .reduce((accInner, {loop, idx}, wireIndex, all) =>
          accInner.push(wire({
            type: 'vertical',
            from: position({
              x: outputGateWidth * (index + 0.5) + 15,
              y: -LABEL_OFFSET + PORT_DISTANCE / 2,
            }),
            toY: gateWidth * idx,
            input: wireIndex,
            inputCount: all.size,
            soderEnd: true,
          })
        ),
        acc
      ),
      I.List()
    ),
  };
};

// calculate the positions for the gates which
// correspond to the loops of the given pla
//
// returns an object {height, gates, wires}
// height is the vertical space loop gates occupy
// gates are the gate objects
// wires are the wire objects connecting the gates with the
// input and output gates
const layoutLoops = (pla, outputGateWidth) => {
  const gateWidth = (2 + Math.max(7, pla.inputs.size));
  const height = pla.loops.size * gateWidth;

  const loopInputs = pla.loops.map((loop) =>
    // each loop has multple input wires
    loop.in
    .reduce((acc, cell, idx) => {
      if (cell === true && pla.mode === 'dnf') {
        // wire is connected to positive input
        return acc.push(PORT_DISTANCE * idx + 4);
      } else if (cell === false && pla.mode === 'dnf') {
        // wire is connected to negated input
        return acc.push(PORT_DISTANCE * idx);
      } if (cell === true && pla.mode === 'knf') {
        // wire is connected to positive input
        return acc.push(PORT_DISTANCE * idx + 4);
      } else if (cell === false && pla.mode === 'knf') {
        // wire is connected to negated input
        return acc.push(PORT_DISTANCE * idx);
      } else {
        // no wire needed for dont-care value
        return acc;
      }
    }, I.List())

  );

  return {
    height: height,
    gates: loopInputs
    // each loop has one gate
    .map((loop, index) => gate({
      type: pla.mode === 'dnf' ? 'and' : 'or',
      center: position({x: 0, y: gateWidth * index}),
      inputCount: loop.size,
      rotation: Rotation.EAST,
      color: pla.loops.get(index).color,
      highlight: pla.loops.get(index).highlight,
      mayOmit: true,
    })),
    wires:
        loopInputs
        .reduce((acc, name, index) => acc.push(
          wire({
            type: 'horizontal',
            from: position({
              x: 5,
              y: gateWidth * index,
            }),
            toX: 15 + (pla.outputs.size) * outputGateWidth,
            input: 0,
            inputCount: 1,
          })
        ), loopInputs
        .reduce((acc, loop, index) =>
          loop.reduce((accInner, inputOffset, idx) =>
            accInner.push(
            wire({
              type: 'horizontal',
              from: position({x: -15 - inputOffset, y: gateWidth * index}),
              toX: -5,
              input: idx,
              inputCount: loop.size,
              soderStart: true,
            })
          ), acc)
        , I.List())
      ),
  };
};

// calculate the width of the largest output gate
const calcOutputGateWidth = (pla) => {
  const outputWireCounts = pla.outputs.map((o, index) =>
    pla.loops
      .map((loop, idx) => ({idx, loop}))
      .filter(({loop}) => loop.out.get(index) === true)
      .count()
  );
  const maxOutputWireCount = Math.max(0, ...outputWireCounts);
  const outputGateWidth = (2 + Math.max(7, maxOutputWireCount));

  return outputGateWidth;
};

// Calculate a circuit layout for the given pla
//
// returns an object {gates, wires, lables, bounds}
// gates is an array of gate objects
// wires is an array of wire objects
export default (pla) => {
  const outputGateWidth = calcOutputGateWidth(pla);
  const loops = layoutLoops(pla, outputGateWidth);
  const inputs = layoutInputs(pla.inputs, loops.height);
  const outputs = layoutOutputs(pla, outputGateWidth);

  return layout({
    gates: loops.gates
      .concat(inputs.gates)
      .concat(outputs.gates),
    wires: loops.wires
      .concat(inputs.wires)
      .concat(outputs.wires),
    labels: inputs.labels
      .concat(outputs.labels),
    bounds: bounds({
      minX: -inputs.width,
      maxX: outputs.width,
      minY: -inputs.height,
      maxY: loops.height,
    }),
  });
};
