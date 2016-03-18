import I from 'immutable';

import {
  expressionFromJson,
} from '../../lib/expression';

import autoDetector from './auto-detector';

// object representing a parse error
const _parseError = I.Record({
  input: null, // input that has been tried to parse
  message: null, // error message as string
  location: null, // location in the string at which the error occured
  language: null, // the language rejected the input
});

// object representing a succeeding result of parsing an input
const _parseResult = I.Record({
  input: null, // input that has been parsed
  language: null, // language that accepted the input
  expressions: I.List(), // list of expressions
}, 'parseResult');

// get a parser that is able to parse input with one of the given languages
// and that is also able to auto detect the language for a given input
// by trying to parse it with each of the languages
export default (languages) => {
  const autoDetect = autoDetector(languages);
  return (input) => {
    try {
      // If the language that is specified by the input is not available
      // try to auto detect the language
      if (!languages.hasOwnProperty(input.langId)) {
        const detected = autoDetect(input.string, languages);

        return _parseResult({
          input: input,
          language: detected.language,
          expressions: detected.ast.map(expressionFromJson),
        });
      }
      // otherwise use the specified language to parse the input
      else {
        const language = languages[input.langId];

        return _parseResult({
          input: input,
          language: language,
          expressions: language.parse(input.string).map(expressionFromJson),
        });
      }
    } catch (e) {
      // if an error occurs throw a parse error
      throw _parseError({
        input: input,
        message: e.message,
        location: e.location,
        language: e.language || languages[input.langId],
      });
    }
  };
};
