const calcLoopCosts = (pla) => {
  // the number of input ports of each loop gate
  const portCount = pla.loops.map((loop) =>
    loop.in.filter((v) => v !== null).length
  )
  // gates with less than 2 input ports can be ignored
  .filter((c) => c > 1)
  ;

  return {
    gates: portCount.length,
    inputs: portCount
      .reduce((acc, count) => acc + count, 0),
  };
};

const calcOutputCosts = (pla) => {
  const outputMap = pla.outputs
    .map((_, index) =>
      // count to how many loop gates
      // this output is connected
      pla.loops.filter(
        (loop) => loop.out[index] === 1
      ).length
    )
    // gates with less than 2 input ports can be ignored
    .filter((c) => c > 1);

  return {
    gates: outputMap.length,
    inputs: outputMap
      .reduce((prev, count) => prev + count, 0),
  };
};

// Get the number of gates and ports needed
// to build the circuit defined by the given pla object
export default (pla) => {
  const loopCosts = calcLoopCosts(pla);
  const outputCosts = calcOutputCosts(pla);

  return {
    gates: loopCosts.gates + outputCosts.gates,
    inputs: loopCosts.inputs + outputCosts.inputs,
  };
};
