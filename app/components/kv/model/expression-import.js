import {fromJSON} from '../lib/diagram';

import {evaluateAll} from '../../logic/lib/evaluation';

const spaces = new RegExp('\\s','gi');
const sanitizeName = (name) =>
  name.replace(spaces, '_')
;

// convert logic expressions into a Karnaugh map
// the expressions are provided as logicNetwork object.
//
// maxInputs limits the number of used identifiers
// maxOutputs limits the number of expressions
export default (logicNetwork, maxInputs, maxOutputs) => {
  if (logicNetwork.freeIdentifiers.size > maxInputs) {
    throw new Error(
      "Expression must not not have more than 8 identifiers"
    );
  }

  if (logicNetwork.sortedExpressions.size > maxOutputs) {
    throw new Error("No more that 7 expressions are allowed");
  }

  const evaluation = evaluateAll({
    expressions: logicNetwork.sortedExpressions.toList(),
    identifiers: logicNetwork.freeIdentifiers,
  });

  const outputs = logicNetwork.sortedExpressions.map((e, expIndex) => ({
    name: e.name ? sanitizeName(e.name) : `O${expIndex + 1}`,
    values: evaluation.map((row) => row.values.get(expIndex)).toArray(),
  })).toArray();

  const json = {
    inputs: logicNetwork.freeIdentifiers
      .map((i) => sanitizeName(i.name)).toArray(),
    outputs,
    loops: [],
  };

  return fromJSON(json);
};
