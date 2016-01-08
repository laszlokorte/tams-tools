export default (pla) => {
  return {
    gates: pla.outputs.length + pla.loops.length,
    inputs: pla.loops.reduce(
      (acc, loop) => acc +
        (loop.in.filter((v) => v !== null).length) +
        loop.out.filter((v) => v === 1).length
    , 0),
  };
};
