import {Observable as O} from 'rx';
import I from 'immutable';

import {
  expressionFromJson,
} from '../lib/expression';

import {
  contextFromLabeledExpression,
} from '../lib/context';

import {
  C, Python, Latex, Math,
} from './languages';

function ParseError({langId, string, message, location, language = null}) {
  this.langId = langId;
  this.string = string;
  this.message = message;
  this.location = location;
  this.language = language;
};

const languages = {
  auto: null,
  c: C,
  latex: Latex,
  math: Math,
  python: Python,
};

const autoDetect = (string) => {
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

const parse = ({string, langId, showSubExpressions}) => {
  const language = languages[langId];

  try {
    if (language === null) {
      const detected = autoDetect(string);
      return {
        langId,
        language: detected.language,
        string,
        showSubExpressions,
        expressions: detected.parsed.map(expressionFromJson),
      };
    } else {
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
      language: e.language || language,
    });
  }
};

const analyze = ({
  language,
  langId, expressions,
  string, showSubExpressions,
}) => {
  const context = contextFromLabeledExpression(expressions);

  return {
    language,
    langId,
    string,
    context,
    showSubExpressions,
  };
};

const handleError = (error) =>
  console.error(error) ||
  O.just({
    langId: error.langId,
    language: error.language,
    error: {
      location: error.location,
      message: error.message,
    },
    string: error.string,
  })
;

export default (actions) => {
  const parsed$ = actions.openExpression$
  .map((string) => JSON.parse(string))
  .startWith({
    langId: 'auto',
    term: '',
  })
  .flatMapLatest(({langId: initialLang, term}) =>
    O.combineLatest(
      actions.input$.startWith(term),
      actions.language$.startWith(initialLang),
      actions.selectFormat$.startWith('math'),
      actions.showSubExpressions$.startWith(false),
      (string, langId, outputFormat, showSubExpressions) =>
        O.just({
          string,
          langId,
          detected: null,
          showSubExpressions,
        })
        .map(parse)
        .map(analyze)
        .catch(handleError)
        .map(({
          language,
          error,
          formatter,
          context,
        }) => ({
          languageList:
            Object.keys(languages)
            .map((id) => ({
              id: id,
              language: languages[id],
            }))
            .filter(({language: l}) => l !== null),
          language,
          langId,
          string,
          error,
          context,
          formatter,
          showSubExpressions,
          outputFormat,
          completions: language ? language.completions : I.List(),
        }))
    ).switch()
  );

  return parsed$.share();
}
;
