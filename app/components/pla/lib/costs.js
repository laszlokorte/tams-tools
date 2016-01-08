const zeroIfLess = (min, val) =>
  val >= min ? val : 0;
;

const calcLoopCosts = (pla) => {
  const portCount = pla.loops.map((loop) =>
    loop.in.filter((v) => v !== null).length
  );

  return {
    gates: portCount.filter((c) => c > 1).length,
    inputs: portCount
    .reduce((acc, count) =>
      acc + zeroIfLess(2, count), 0),
  };
};

const calcOutputCosts = (pla) => {
  const outputMap = pla.outputs
    .map((_, index) =>
      pla.loops.filter(
        (loop) => loop.out[index] === 1
      ).length
    );

  return {
    gates: outputMap.filter((c) => c > 1).length,
    inputs: outputMap
    .reduce((prev, count) =>
      prev + zeroIfLess(2, count)
    , 0),
  };
};

export default (pla) => {
  const loopCosts = calcLoopCosts(pla);
  const outputCosts = calcOutputCosts(pla);

  return {
    gates: loopCosts.gates + outputCosts.gates,
    inputs: loopCosts.inputs + outputCosts.inputs,
  };
};
