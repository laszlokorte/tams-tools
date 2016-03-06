import {expressionListToString} from '../lib/formatter';

export const buildFormula = (context, formatter) =>
  context !== null ?
  expressionListToString(
    context.expressions,
    formatter
  ) : ''
;
