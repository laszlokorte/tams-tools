import I from 'immutable';

import {input as _input} from './io';

// a detection is a successful result of trying to parse a string
// with one of multiple possible parsers / languages
const _detection = I.Record({
  ast: null, // the sucessfully created abstract syntax tree
  language: null, // the language which was used to create the ast
  langId: null, // the id/name of the language
});

// a detectionError is a failed attempt to parse a given input
// with any parser / language
const _detectionError = I.Record({
  input: null, // the input for which no language could be detected
  message: null, // The error message explaining the failure
  location: null, // the location at which processing the input failed
  language: null, // the language that was able to consume the most of the input
});

// create a function that tries to parse a string with multiple
// languages / parers
// that function returns an detection object if parsing the string succeeds
// it throws an detectionError if parsing fails with all of the languages
export default (languages) => (string) => {
  let prevError = null;
  let prevDetected = null;

  for (const langId of Object.keys(languages)) {
    const lang = languages[langId];
    if (lang === null) {
      continue;
    }
    try {
      return _detection({
        ast: lang.parse(string),
        language: lang,
        langId: langId,
      });
    } catch (error) {
      if (prevError === null) {
        prevDetected = langId;
        prevError = error;
      } else if (
        error.location.start.offset >
        prevError.location.start.offset
      ) {
        prevDetected = langId;
        prevError = error;
      }
    }
  };

  throw _detectionError({
    input: _input({string: string, langId: prevDetected}),
    language: languages[prevDetected],
    message: prevError.message,
    location: prevError.location,
  });
};
