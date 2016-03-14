import {expressionListToString} from '../lib/formatter';

export const buildFormula = (logicNetwork, formatter) =>
  logicNetwork !== null ?
  expressionListToString(
    logicNetwork.expressions,
    formatter
  ) : ''
;
