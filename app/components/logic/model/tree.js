import I from 'immutable';

import {evaluator} from '../lib/evaluation';
import toTree from '../lib/tree';

const evaluateSubExpressions = (context, selectedRow = null) => {
  if (selectedRow === null) {
    return null;
  }

  const identifierMap = I.Map(context.freeIdentifiers.map(
    (name, i) => [name, !!(Math.pow(2, i) & selectedRow)]
  ));

  return context.sortedExpressions.reduce(
    evaluator,
    context.subExpressions.reduce(evaluator, identifierMap)
  );
};

export const buildTree = (context, selectedRow = null) => {
  if (context === null ||
    context.expressions.size === 0
  ) {
    return null;
  }

  const subEvalutation = evaluateSubExpressions(
    context, selectedRow
  );

  if (context.expressions.size === 1) {
    return toTree(context.expressions.get(0), subEvalutation);
  } else {
    return {
      name: 'Expression List',
      children: context.expressions.map(
        (e) => toTree(e, subEvalutation)
      ).toArray(),
      hidden: true,
    };
  }
};
