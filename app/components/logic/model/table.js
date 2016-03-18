import toTable from '../lib/table';

// build a function table for a logicNetwork using a given formatter
// showSubExpressions - if the table should contains columns for
//                      the sub expressions
export const buildTable = (logicNetwork, showSubExpressions, formatter) =>
  logicNetwork &&
  logicNetwork.expressions.size ? toTable(
    logicNetwork,
    showSubExpressions,
    formatter
  ) : null
;
