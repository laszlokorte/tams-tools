
const incomingCountIsEmpty = (node) =>
  node.incomingCount === 0
;

export default (nodes) => {
  let result = [];

  nodes.forEach((node) => {
    node.outgoing.forEach((dep) => {
      dep.incomingCount += 1;
    });
  });

  const rootNodes = new Set(
    nodes.filter(incomingCountIsEmpty)
  );

  for (let n of rootNodes) {
    rootNodes.delete(n);
    result.push(n);

    for (let m of n.outgoing) {
      n.outgoing.delete(m);
      m.incomingCount--;
      if (m.incomingCount === 0) {
        rootNodes.add(m);
      }
    }
  }

  const cycle = nodes.filter((n) => n.incomingCount > 0);
  if (cycle.length) {
    const error = new Error("Cyclic dependency");
    error.cycle = cycle;
    throw error;
  }

  return result;
};
