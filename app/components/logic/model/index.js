import {Observable as O} from 'rx';
import I from 'immutable';

import {
  expressionFromJson,
  collectIdentifiers,
  collectSubExpressions,
  evaluateAll,
} from '../lib/expression';

import cParser from '../lib/syntax/logic-c.pegjs';
import latexParser from '../lib/syntax/logic-latex.pegjs';
import mathParser from '../lib/syntax/logic-math.pegjs';
import pythonParser from '../lib/syntax/logic-python.pegjs';

function ParseError(lang, string, name, location) {
  this.lang = lang;
  this.string = string;
  this.name = name;
  this.location = location;
};

const language = I.Record({
  name: null,
  parse: () => { throw new Error("not implemented"); },
});

const cLang = language({
  name: 'C',
  parse: (string) => {
    return {
      lang: 'c',
      parsed: cParser.parse(string),
    };
  },
});

const latexLang = language({
  name: 'Latex',
  parse: (string) => {
    return {
      lang: 'latex',
      parsed: latexParser.parse(string),
    };
  },
});

const pythonLang = language({
  name: 'Python',
  parse: (string) => {
    return {
      lang: 'python',
      parsed: pythonParser.parse(string),
    };
  },
});

const mathLang = language({
  name: 'Math',
  parse: (string) => {
    return {
      lang: 'math',
      parsed: mathParser.parse(string),
    };
  },
});

const allLanguages = [
  cLang,
  pythonLang,
  latexLang,
  mathLang,
];

const autoLang = language({
  name: 'Auto detect',
  parse: (string) => {
    for (const lang of allLanguages) {
      try {
        const result = lang.parse(string);
        return {
          parsed: result.parsed,
          lang: 'auto',
          detected: result.lang,
        };
      } catch (e) {

      }
    }

    throw new ParseError('auto', string, 'can not detect', null);
  },
});

const languages = {
  auto: autoLang,
  c: cLang,
  latex: latexLang,
  math: mathLang,
  python: pythonLang,
};

const parse = ({string, lang, showSubExpressions}) => {
  try {
    const parseResult = languages[lang]
      .parse(string);

    return {
      lang: parseResult.lang,
      detected: parseResult.detected,
      string,
      showSubExpressions,
      expressions: parseResult.parsed.map(expressionFromJson),
    };
  } catch (e) {
    throw new ParseError(lang, string, e.name, e.location);
  }
};

const analyze = ({lang, detected, expressions, string, showSubExpressions}) => {
  const expressionList = I.List(expressions);

  const identifiers = expressionList.flatMap(
    (expression) => collectIdentifiers(expression)
  ).toSet().toList();

  const subExpressions = showSubExpressions ? expressionList.flatMap(
    (expression) => collectSubExpressions(expression)
      .reverse().toList()
  ) : expressionList;

  const table = evaluateAll({
    expressions: subExpressions,
    identifiers,
  });

  return {
    lang,
    detected,
    string,
    expressions: expressionList,
    identifiers,
    table,
    subExpressions,
    showSubExpressions,
  };
};

const handleError = (error) =>
  O.just({
    lang: error.lang,
    detected: null,
    error: {
      location: error.location,
      name: error.name,
    },
    string: error.string,
  })
;

export default (actions) => {
  const parsed$ = O.combineLatest(
    actions.input$.startWith(''),
    actions.language$.startWith('auto'),
    actions.showSubExpressions$.startWith(true),
    (string, lang, showSubExpressions) =>
      O.just({
        string,
        lang,
        detected: null,
        showSubExpressions,
      })
      .map(parse)
      .map(analyze)
      .catch(handleError)
  ).switch()
  .do(::console.log);

  return parsed$;
}
;
