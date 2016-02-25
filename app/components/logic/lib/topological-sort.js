/* eslint-disable no-class/no-class */
export class Node {
  constructor(data, outgoing = new Set(), incomingCount = 0) {
    this.data = data;
    this.outgoing = outgoing;
    this.incomingCount = incomingCount;
  };
};
/* eslint-enable no-class/no-class */

const incomingCountIsEmpty = (node) =>
  node.incomingCount === 0
;

export const sort = (nodes) => {
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

  const cycle = nodes.filter((node) => !incomingCountIsEmpty(node));
  if (cycle.length) {
    const error = new Error("Cyclic dependency");
    error.cycle = cycle;
    throw error;
  }

  return result;
};
