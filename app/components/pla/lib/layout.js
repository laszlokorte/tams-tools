// The direction in which the output
// port of a gate is pointing
export const Rotation = {
  NORTH: 0,
  EAST: 1,
  SOUTH: 2,
  WEST: 3,
};

// Calculate the layout for the given input ports
const layoutInputs = (inputs, height) => {
  return {
    height: 25,
    width: 12 + 10 * inputs.length,
    labels: inputs.map((name, index) => ({
      text: name,
      anchor: {x: -10 * index - 18, y: -23},
      align: 'start',
    })),
    gates: inputs.map((name, index) => ({
      type: 'negator',
      center: {x: -10 * index - 15, y: -15},
      inputCount: 1,
      rotation: Rotation.SOUTH,
    })),
    wires: Array.prototype.concat.apply([],
      inputs.map((name, index) => [
        {
          type: 'vertical',
          from: {x: -10 * index - 19, y: -23},
          toY: height - 5,
          input: 0,
          inputCount: 1,
          soderStart: true,
        },
        {
          type: 'vertical',
          from: {x: -10 * index - 15, y: -15 + 5},
          toY: height - 5,
          input: 0,
          inputCount: 1,
        },
        {
          type: 'horizontal',
          from: {x: -10 * index - 19, y: -15 - 5},
          toX: -10 * index - 15,
          input: 0,
          inputCount: 1,
          soderStart: true,
        },
      ])
    ),
  };
};

// calculate the layout of the output gates
// for the given pla
const layoutOutputs = (pla, outputGateWidth) => {
  const gateWidth = (2 + Math.max(7, pla.inputs.length));
  const outputWireCount = pla.outputs.map(
    (_, index) => pla.loops
      .filter((loop) =>
        loop.out[index] === 1
      ).length
    )
  ;

  return {
    width: 17 + outputGateWidth * pla.outputs.length,
    labels: pla.outputs.map((name, index) => ({
      text: name,
      anchor: {
        x: outputGateWidth * (index + 0.5) + 15,
        y: -22,
      },
      align: 'middle',
    })),
    gates: pla.outputs.map((name, index) => ({
      type: pla.mode === 'dnf' ? 'or' : 'and',
      center: {
        x: outputGateWidth * (index + 0.5) + 15,
        y: -15,
      },
      inputCount: outputWireCount[index],
      rotation: Rotation.NORTH,
      soderOutput: true,
      mayOmit: true,
    })),
    wires: Array.prototype.concat.apply([],
      pla.outputs.map((_, index) =>
        pla.loops
          .map((loop, idx) => ({idx, loop}))
          .filter(({loop}) => loop.out[index] === 1)
          .map(({loop, idx}, wireIndex, all) => ({
            type: 'vertical',
            from: {
              x: outputGateWidth * (index + 0.5) + 15,
              y: -15 + 5,
            },
            toY: gateWidth * idx,
            input: wireIndex,
            inputCount: all.length,
            soderEnd: true,
          })
        )
      )
    ),
  };
};

// calculate the positions for the gates which
// correspond to the loops of the given pla
const layoutLoops = (pla, outputGateWidth) => {
  const gateWidth = (2 + Math.max(7, pla.inputs.length));
  const height = pla.loops.length * gateWidth;

  const loopInputs = pla.loops.map((loop) =>
    Array.prototype.concat.apply([],
      loop.in
      .map((cell, idx) => {
        if (cell === 1 && pla.mode === 'dnf') {
          return [2 * idx * 5 + 4];
        } else if (cell === 0 && pla.mode === 'dnf') {
          return [2 * idx * 5];
        } if (cell === 0 && pla.mode === 'knf') {
          return [2 * idx * 5 + 4];
        } else if (cell === 1 && pla.mode === 'knf') {
          return [2 * idx * 5];
        } else {
          return [];
        }
      }))
  );

  return {
    height: height,
    labels: [],
    gates: loopInputs
    .map((loop, index) => ({
      type: pla.mode === 'dnf' ? 'and' : 'or',
      center: {x: 0, y: gateWidth * index},
      inputCount: loop.length,
      rotation: Rotation.EAST,
      color: pla.loops[index].color,
      highlight: pla.loops[index].highlight,
      mayOmit: true,
    })),
    wires: Array.prototype.concat.apply([],
      loopInputs
        .map((loop, index) =>
          loop.map((inputOffset, idx) => ({
            type: 'horizontal',
            from: {x: -15 - inputOffset, y: gateWidth * index},
            toX: -5,
            input: idx,
            inputCount: loop.length,
            soderStart: true,
          })
      )).concat(
        loopInputs
        .map((name, index) => [
          {
            type: 'horizontal',
            from: {
              x: 5,
              y: gateWidth * index,
            },
            toX: 15 + (pla.outputs.length) * outputGateWidth,
            input: 0,
            inputCount: 1,
          },
        ])
      )
    ),
  };
};

// calculate the width of the largest output gate
const calcOutputGateWidth = (pla) => {
  const outputWireCounts = pla.outputs.map((o, index) =>
    pla.loops
      .map((loop, idx) => ({idx, loop}))
      .filter(({loop}) => loop.out[index] === 1)
      .length
  );
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
