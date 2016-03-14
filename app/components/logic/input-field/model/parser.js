import I from 'immutable';

import {
  expressionFromJson,
} from '../../lib/expression';

import autoDetector from './auto-detector';

const _parseError = I.Record({
  input: null,
  message: null,
  location: null,
  language: null,
});

const _parseResult = I.Record({
  input: null,
  language: null,
  expressions: I.List(),
}, 'parseResult');

export default (languages) => {
  const autoDetect = autoDetector(languages);
  return (input) => {
    try {
      if (!languages.hasOwnProperty(input.langId)) {
        const detected = autoDetect(input.string, languages);

        return _parseResult({
          input: input,
          language: detected.language,
          expressions: detected.ast.map(expressionFromJson),
        });
      } else {
        const language = languages[input.langId];

        return _parseResult({
          input: input,
          language: language,
          expressions: language.parse(input.string).map(expressionFromJson),
        });
      }
    } catch (e) {
      throw _parseError({
        input: input,
        message: e.message,
        location: e.location,
        language: e.language || languages[input.langId],
      });
    }
  };
};
