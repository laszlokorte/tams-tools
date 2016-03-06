import I from 'immutable';

import {
  contextFromLabeledExpressions,
} from '../../lib/context';

const _analysisResult = I.Record({
  language: null,
  expressionContext: null,
  error: null,
}, 'analysisResult');

export const analyse = (parserResult) => {
  try {
    const context = contextFromLabeledExpressions(
      parserResult.expressions
    );

    return _analysisResult({
      language: parserResult.language,
      expressionContext: context,
    });
  } catch (e) {
    return _analysisResult({
      language: parserResult.language,
      error: e,
    });
  }
};
