import I from 'immutable';

import {
  logicNetworkFromExpressions,
} from '../../lib/network';

const _analysisResult = I.Record({
  language: null,
  network: null,
  error: null,
}, 'analysisResult');

export const postProcess = (parserResult) => {
  try {
    const network = logicNetworkFromExpressions(
      parserResult.expressions
    );

    return _analysisResult({
      language: parserResult.language,
      network: network,
    });
  } catch (e) {
    return _analysisResult({
      language: parserResult.language,
      error: e,
    });
  }
};
