import I from 'immutable';

// The direction in which the output
// port of a gate is pointing
export const Rotation = {
  NORTH: 0,
  EAST: 1,
  SOUTH: 2,
  WEST: 3,
};

const position = I.Record({
  x: 0,
  y: 0,
}, 'plaPosition');

const gate = I.Record({
  type: null,
  center: position(),
  inputCount: 0,
  rotation: Rotation.NORTH,
  soderOutput: false,
  soderInput: false,
  mayOmit: false,
  color: null,
  highlight: null,
}, 'plaGate');

const wire = I.Record({
  type: 'horizontal',
  from: position(),
  toX: 0,
  toY: 0,
  input: 0,
  inputCount: 1,
  soderStart: false,
  soderEnd: false,
}, 'plaWire');

const label = I.Record({
  text: '',
  anchor: position(),
  align: 'middle',
}, 'plaLabel');

// Calculate the layout for the given input ports
const layoutInputs = (inputs, height) => {
  return {
    height: 25,
    width: 12 + 10 * inputs.size,
    labels: inputs.map((name, index) => label({
      text: name,
      anchor: position({x: -10 * index - 18, y: -23}),
      align: 'start',
    })).toArray(),
    gates: inputs.map((name, index) => gate({
      type: 'negator',
      center: position({x: -10 * index - 15, y: -15}),
      inputCount: 1,
      rotation: Rotation.SOUTH,
    })).toArray(),
    wires: Array.prototype.concat.apply([],
      inputs.map((name, index) => [
        wire({
          type: 'vertical',
          from: position({x: -10 * index - 19, y: -23}),
          toY: height - 5,
          input: 0,
          inputCount: 1,
          soderStart: true,
        }),
        wire({
          type: 'vertical',
          from: position({x: -10 * index - 15, y: -15 + 5}),
          toY: height - 5,
          input: 0,
          inputCount: 1,
        }),
        wire({
          type: 'horizontal',
          from: position({x: -10 * index - 19, y: -15 - 5}),
          toX: -10 * index - 15,
          input: 0,
          inputCount: 1,
          soderStart: true,
        }),
      ]).toArray()
    ),
  };
};

// calculate the layout of the output gates
// for the given pla
const layoutOutputs = (pla, outputGateWidth) => {
  const gateWidth = (2 + Math.max(7, pla.inputs.size));
  const outputWireCount = pla.outputs.map(
    (_, index) => pla.loops
      .filter((loop) =>
        loop.out.get(index) === true
      ).count()
    ).toArray()
  ;

  return {
    width: 17 + outputGateWidth * pla.outputs.size,
    labels: pla.outputs.map((name, index) => label({
      text: name,
      anchor: position({
        x: outputGateWidth * (index + 0.5) + 15,
        y: -22,
      }),
      align: 'middle',
    })).toArray(),
    gates: pla.outputs.map((name, index) => gate({
      type: pla.mode === 'dnf' ? 'or' : 'and',
      center: position({
        x: outputGateWidth * (index + 0.5) + 15,
        y: -15,
      }),
      inputCount: outputWireCount[index],
      rotation: Rotation.NORTH,
      soderOutput: true,
      mayOmit: true,
    })).toArray(),
    wires: Array.prototype.concat.apply([],
      pla.outputs.map((_, index) =>
        pla.loops
          .map((loop, idx) => ({idx, loop}))
          .filter(({loop}) => loop.out.get(index) === true)
          .map(({loop, idx}, wireIndex, all) => wire({
            type: 'vertical',
            from: position({
              x: outputGateWidth * (index + 0.5) + 15,
              y: -15 + 5,
            }),
            toY: gateWidth * idx,
            input: wireIndex,
            inputCount: all.size,
            soderEnd: true,
          })
        ).toArray()
      ).toArray()
    ),
  };
};

// calculate the positions for the gates which
// correspond to the loops of the given pla
const layoutLoops = (pla, outputGateWidth) => {
  const gateWidth = (2 + Math.max(7, pla.inputs.size));
  const height = pla.loops.size * gateWidth;

  const loopInputs = pla.loops.map((loop) =>
    Array.prototype.concat.apply([],
      loop.in
      .map((cell, idx) => {
        if (cell === true && pla.mode === 'dnf') {
          return [2 * idx * 5 + 4];
        } else if (cell === false && pla.mode === 'dnf') {
          return [2 * idx * 5];
        } if (cell === true && pla.mode === 'knf') {
          return [2 * idx * 5 + 4];
        } else if (cell === false && pla.mode === 'knf') {
          return [2 * idx * 5];
        } else {
          return [];
        }
      }).toArray())
  );

  return {
    height: height,
    labels: [],
    gates: loopInputs
    .map((loop, index) => gate({
      type: pla.mode === 'dnf' ? 'and' : 'or',
      center: position({x: 0, y: gateWidth * index}),
      inputCount: loop.length,
      rotation: Rotation.EAST,
      color: pla.loops.get(index).color,
      highlight: pla.loops.get(index).highlight,
      mayOmit: true,
    })).toArray(),
    wires: Array.prototype.concat.apply([],
      loopInputs
        .map((loop, index) =>
          loop.map((inputOffset, idx) => wire({
            type: 'horizontal',
            from: position({x: -15 - inputOffset, y: gateWidth * index}),
            toX: -5,
            input: idx,
            inputCount: loop.length,
            soderStart: true,
          })
      )).concat(
        loopInputs
        .map((name, index) => [
          wire({
            type: 'horizontal',
            from: position({
              x: 5,
              y: gateWidth * index,
            }),
            toX: 15 + (pla.outputs.size) * outputGateWidth,
            input: 0,
            inputCount: 1,
          }),
        ])
      ).toArray()
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
  ).toArray();
  const maxOutputWireCount = Math.max(0, ...outputWireCounts);
  const outputGateWidth = (2 + Math.max(7, maxOutputWireCount));

  return outputGateWidth;
};

// Calculate a circuit layout for the given pla
export default (pla) => {
  const outputGateWidth = calcOutputGateWidth(pla);
  const loops = layoutLoops(pla, outputGateWidth);
  const inputs = layoutInputs(pla.inputs, loops.height);
  const outputs = layoutOutputs(pla, outputGateWidth);

  return {
    gates: Array.prototype.concat.call(
      loops.gates,
      inputs.gates,
      outputs.gates
    ),
    wires: Array.prototype.concat.call(
      loops.wires,
      inputs.wires,
      outputs.wires
    ),
    labels: Array.prototype.concat.call(
      loops.labels,
      inputs.labels,
      outputs.labels
    ),
    bounds: {
      minX: -inputs.width,
      maxX: outputs.width,
      minY: -inputs.height,
      maxY: loops.height,
    },
  };
};
