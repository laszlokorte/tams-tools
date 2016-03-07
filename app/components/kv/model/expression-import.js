import {fromJSON} from '../lib/diagram';

import {evaluateAll} from '../../logic/lib/evaluation';

export default (context) => {
  if (
    context.freeIdentifiers.size > 8
  ) {
    throw new Error(
      "Expression must not not have more than 8 identifiers"
    );
  }

  if (
    context.sortedExpressions.size > 7
  ) {
    throw new Error("No more that 7 expressions are allowed");
  }

  const evaluation = evaluateAll({
    expressions: context.sortedExpressions.toList(),
    identifiers: context.freeIdentifiers,
  });

  const outputs = context.sortedExpressions.map((e, expIndex) => ({
    name: e.name || `O${expIndex + 1}`,
    values: evaluation.map((row) => row.values.get(expIndex)).toArray(),
  })).toArray();

  const json = {
    inputs: context.freeIdentifiers.map((i) => i.name).toArray(),
    outputs,
    loops: [],
  };

  console.log(json);

  return fromJSON(json);
};
