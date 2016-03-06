import I from 'immutable';

import {input as _input} from './io';

const _detection = I.Record({
  result: null,
  language: null,
  langId: null,
});

const _detectionError = I.Record({
  input: null,
  message: null,
  location: null,
  language: null,
});

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
        result: lang.parse(string),
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
