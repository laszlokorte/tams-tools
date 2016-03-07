import {fromJSON} from '../lib/diagram';

const evaluate = (context, e) => {
  return Array.apply(Array, {
    length: Math.pow(2, context.freeIdentifiers.size),
  }).map(() => null);
};

export default (context) => {
  console.log(context.toJS());
  if (
    context.freeIdentifiers.size > 8
  ) {
    throw new Error(
      "Expression must not not have more than 8 identifiers"
    );
  }

  if (
    context.toplevelExpressions.size > 7
  ) {
    throw new Error("No more that 7 expressions are allowed");
  }

  return fromJSON({
    inputs: context.freeIdentifiers.map((i) => i.name).toArray(),
    outputs: context.toplevelExpressions.map((e, expIndex) => ({
      name: e.name || `O${expIndex + 1}`,
      values: evaluate(context, e),
    })).toArray(),
    loops: [],
  });
};
