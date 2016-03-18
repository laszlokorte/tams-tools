/* eslint-disable no-class/no-class */
export class Node {
  constructor(data, outgoing = new window.Set(), incomingCount = 0) {
    this.data = data;
    this.outgoing = outgoing;
    this.incomingCount = incomingCount;
  };
};
/* eslint-enable no-class/no-class */

// check if the incouming count of the given node is 0
// ie if no edges point to this node
const incomingCountIsEmpty = (node) =>
  node.incomingCount === 0
;

// sort the list of nodes topologically
// nodes should form an acyclic graph
// throws if cycle is detected
export const sort = (nodes) => {
  let result = [];

  // calculate the incoming count for each node
  nodes.forEach((node) => {
    node.outgoing.forEach((dep) => {
      dep.incomingCount += 1;
    });
  });

  // take the nodes whose incominCount is empty
  // ie nodes at the root of the graph
  const rootNodes = new window.Set(
    nodes.filter(incomingCountIsEmpty)
  );

  // until the set of root nodes is empty:
  //   - move a node from the set of root nodes
  //     to the result set
  //   - and remove all outgoing edges from that node.
  //
  //   by removing the outdoing edges some new root nodes may arrise
  //   - which are then added to the set of root nodes
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

  // Nodes that still have edges belong to a cycle
  const cycle = nodes.filter(
    (node) => !incomingCountIsEmpty(node)
  );

  // throw if an cycle exists
  if (cycle.size) {
    const error = new Error("Cyclic dependency");
    error.cycle = cycle;
    throw error;
  }

  return result;
};
