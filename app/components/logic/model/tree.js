import I from 'immutable';

import {evaluator} from '../lib/evaluation';
import toTree from '../lib/tree';

// evaluate all sub expression of the given logicNetwork
// selectedRow determines the input values
//
// returns an map containing true|false|null for each sub expression
const evaluateSubExpressions = (logicNetwork, selectedRow) => {
  const identifierMap = I.Map(logicNetwork.freeIdentifiers.map(
    (name, i) => [name, !!(Math.pow(2, i) & selectedRow)]
  ));

  return logicNetwork.sortedExpressions.reduce(
    evaluator,
    logicNetwork.subExpressions.reduce(evaluator, identifierMap)
  );
};

// builds a colored operator tree of the given logicNetwork
// selectedRow is the row of the function table and determines
// the input values used for evaluation
export const buildTree = (logicNetwork, formatter, selectedRow = null) => {
  if (logicNetwork === null ||
    logicNetwork.expressions.size === 0
  ) {
    return null;
  }

  const subEvalutation = selectedRow === null ? null :
    evaluateSubExpressions(logicNetwork, selectedRow)
  ;

  if (logicNetwork.expressions.size === 1) {
    // If the network contains only one expression the tree is build
    // for this single expression
    return toTree(logicNetwork.expressions.get(0), formatter, subEvalutation);
  } else {
    // Ff the network contains more than one expression
    // an additional root node is created to contain all
    // expression nodes
    return {
      name: 'Expression List',
      formattedName: ' ',
      children: logicNetwork.expressions.map(
        (e) => toTree(e, formatter, subEvalutation)
      ).toArray(),
      hidden: true,
    };
  }
};
