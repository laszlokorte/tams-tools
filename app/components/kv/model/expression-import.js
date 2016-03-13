import {fromJSON} from '../lib/diagram';

import {evaluateAll} from '../../logic/lib/evaluation';

const spaces = new RegExp('\\s','gi');
const sanitizeName = (name) =>
  name.replace(spaces, '_')
;

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
    name: e.name ? sanitizeName(e.name) : `O${expIndex + 1}`,
    values: evaluation.map((row) => row.values.get(expIndex)).toArray(),
  })).toArray();

  const json = {
    inputs: context.freeIdentifiers
      .map((i) => sanitizeName(i.name)).toArray(),
    outputs,
    loops: [],
  };

  console.log(json);

  return fromJSON(json);
};
