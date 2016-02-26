import ParseError from './parse-error';
import {
  expressionFromJson,
} from '../lib/expression';

import autoDetect from './auto-detect';

export default (languages) => ({string, langId, showSubExpressions}) => {
  try {
    if (!languages.hasOwnProperty(langId)) {
      const detected = autoDetect(string, languages);
      return {
        langId,
        language: detected.language,
        string,
        showSubExpressions,
        expressions: detected.parsed.map(expressionFromJson),
      };
    } else {
      const language = languages[langId];

      return {
        langId,
        language: language,
        string,
        showSubExpressions,
        expressions: language.parse(string).map(expressionFromJson),
      };
    }
  } catch (e) {
    throw new ParseError({
      langId, string,
      message: e.message,
      location: e.location,
      language: e.language || languages[langId],
    });
  }
};
