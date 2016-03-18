import I from 'immutable';

import {
  logicNetworkFromExpressions,
} from '../../lib/network';

const _postProcessing = I.Record({
  language: null,
  network: null,
  error: null,
}, 'postProcessing');

// post process the result of a parser to generate a logic network
// that contains additional information about the abstract syntax tree
export const postProcess = (parserResult) => {
  try {
    const network = logicNetworkFromExpressions(
      parserResult.expressions
    );

    return _postProcessing({
      language: parserResult.language,
      network: network,
    });
  } catch (e) {
    return _postProcessing({
      language: parserResult.language,
      error: e,
    });
  }
};
