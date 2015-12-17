import {Rotation} from './gates';

const layoutInputs = (inputs, height) => {
  return {
    height: 25,
    width: 12 + 10 * inputs.length,
    gates: inputs.map((name, index) => ({
      type: 'negator',
      center: {x: -10 * index - 15, y: -height / 2 - 15},
      inputCount: 1,
      rotation: Rotation.SOUTH,
    })),
    wires: Array.prototype.concat.apply([],
      inputs.map((name, index) => [
        {
          type: 'vertical',
          from: {x: -10 * index - 19, y: -height / 2 - 23},
          toY: height / 2 - 5,
          input: 0,
          inputCount: 1,
          soderStart: true,
        },
        {
          type: 'vertical',
          from: {x: -10 * index - 15, y: -height / 2 - 15 + 5},
          toY: height / 2 - 5,
          input: 0,
          inputCount: 1,
        },
        {
          type: 'horizontal',
          from: {x: -10 * index - 19, y: -height / 2 - 15 - 5},
          toX: -10 * index - 15,
          input: 0,
          inputCount: 1,
          soderStart: true,
        },
      ])
    ),
  };
};

const layoutOutputs = (pla, height, loopCount) => {
  const outputGateWidth = (2 + Math.max(7, loopCount));
  const gateWidth = (2 + Math.max(7, pla.inputs.length));
  const outputWireCount = pla.outputs.map(
    (_, index) => pla.loops
      .filter((loop) =>
        loop[index + pla.inputs.length] === 1
      ).length
    )
  ;

  return {
    width: 12 + outputGateWidth * pla.outputs.length,
    gates: pla.outputs.map((name, index) => ({
      type: 'or',
      center: {
        x: outputGateWidth * index + 15,
        y: -height / 2 - 15,
      },
      inputCount: outputWireCount[index],
      rotation: Rotation.NORTH,
      soderOutput: true,
    })),
    wires: Array.prototype.concat.apply([],
      pla.outputs.map((_, index) =>
        Array.prototype.concat.apply([],
          pla.loops
            .map((loop, idx) => ({idx, loop}))
            .filter(({loop}) => loop[index + pla.inputs.length] === 1)
            .map(({loop, idx}, wireIndex, all) => [{
              type: 'vertical',
              from: {x: outputGateWidth * index + 15, y: -height / 2 - 15 + 5},
              toY: -height / 2 + gateWidth * idx,
              input: wireIndex,
              inputCount: all.length,
              soderEnd: true,
            }]
            )
        )
      )
    ),
  };
};

const layoutLoops = (pla) => {
  const outputGateWidth = (2 + Math.max(7, pla.loops.length));
  const gateWidth = (2 + Math.max(7, pla.inputs.length));
  const height = pla.loops.length * gateWidth;

  const loopInputs = pla.loops.map((loop) =>
    Array.prototype.concat.apply([],
      loop.slice(0, pla.inputs.length)
      .map((cell, idx) => {
        if (cell === 1) {
          return [2 * idx * 5 + 4];
        } else if (cell === 0) {
          return [2 * idx * 5];
        } else {
          return [];
        }
      }))
  );

  return {
    height: height,
    gates: loopInputs.map((loop, index) => ({
      type: 'and',
      center: {x: 0, y: -height / 2 + gateWidth * index},
      inputCount: loop.length,
      rotation: Rotation.EAST,
    })),
    wires: Array.prototype.concat.apply([],
      loopInputs
        .map((loop, index) =>
        Array.prototype.concat.apply([], loop.map((inputOffset, idx) => ({
          type: 'horizontal',
          from: {x: -15 - inputOffset, y: -height / 2 + gateWidth * index},
          toX: -5,
          input: idx,
          inputCount: loop.length,
          soderStart: true,
        }))
      )).concat(
        pla.loops.map((name, index) => [
          {
            type: 'horizontal',
            from: {
              x: 5,
              y: -height / 2 + gateWidth * index,
            },
            toX: 10 + pla.outputs.length * outputGateWidth,
            input: 0,
            inputCount: 1,
          },
        ])
      )
    ),
  };
};

export default (pla) => {
  const loops = layoutLoops(pla);
  const inputs = layoutInputs(pla.inputs, loops.height);
  const outputs = layoutOutputs(pla, loops.height, pla.loops.length);

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
    bounds: {
      minX: -inputs.width,
      maxX: outputs.width,
      minY: -loops.height / 2 - inputs.height,
      maxY: loops.height / 2,
    },
  };
};
