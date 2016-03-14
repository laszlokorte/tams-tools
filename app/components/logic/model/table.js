import toTable from '../lib/table';

export const buildTable = (logicNetwork, showSubExpressions, formatter) =>
  logicNetwork &&
  logicNetwork.expressions.size ? toTable(
    logicNetwork,
    showSubExpressions,
    formatter
  ) : null
;
