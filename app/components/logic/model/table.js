import toTable from '../lib/table';

export const buildTable = (context, showSubExpressions, formatter) =>
  context &&
  context.expressions.size ? toTable(
    context,
    showSubExpressions,
    formatter
  ) : null
;
