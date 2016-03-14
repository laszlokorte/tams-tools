import I from 'immutable';

import {evaluator} from '../lib/evaluation';
import toTree from '../lib/tree';

const evaluateSubExpressions = (logicNetwork, selectedRow = null) => {
  if (selectedRow === null) {
    return null;
  }

  const identifierMap = I.Map(logicNetwork.freeIdentifiers.map(
    (name, i) => [name, !!(Math.pow(2, i) & selectedRow)]
  ));

  return logicNetwork.sortedExpressions.reduce(
    evaluator,
    logicNetwork.subExpressions.reduce(evaluator, identifierMap)
  );
};

export const buildTree = (logicNetwork, selectedRow = null) => {
  if (logicNetwork === null ||
    logicNetwork.expressions.size === 0
  ) {
    return null;
  }

  const subEvalutation = evaluateSubExpressions(
    logicNetwork, selectedRow
  );

  if (logicNetwork.expressions.size === 1) {
    return toTree(logicNetwork.expressions.get(0), subEvalutation);
  } else {
    return {
      name: 'Expression List',
      children: logicNetwork.expressions.map(
        (e) => toTree(e, subEvalutation)
      ).toArray(),
      hidden: true,
    };
  }
};
