import {expressionListToString} from '../lib/formatter';

// convert a logicNetwork into a string using the given formatter
export const buildFormula = (logicNetwork, formatter) =>
  logicNetwork !== null ?
  expressionListToString(
    logicNetwork.expressions,
    formatter
  ) : ''
;
