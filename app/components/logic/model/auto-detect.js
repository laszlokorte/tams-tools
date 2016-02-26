import ParseError from './parse-error';

export default (string, languages) => {
  let prevError = null;
  let prevDetected = null;

  for (const langId of Object.keys(languages)) {
    const lang = languages[langId];
    if (lang === null) {
      continue;
    }
    try {
      return {
        parsed: lang.parse(string),
        language: lang,
        langId: langId,
      };
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

  throw new ParseError({
    langId: prevDetected,
    language: languages[prevDetected],
    string,
    message: prevError.message,
    location: prevError.location,
  });
};
