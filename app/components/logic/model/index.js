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

const autoParser = {
  parse: () => { throw new Error("not implemented"); },
};

const parsers = {
  auto: autoParser,
  c: cParser,
  latex: latexParser,
  math: mathParser,
  python: pythonParser,
};

function ParseError(lang, string, name, location) {
  this.lang = lang;
  this.string = string;
  this.name = name;
  this.location = location;
};

const parse = ({string, lang}) => {
  try {
    return {
      lang,
      string,
      expressions: parsers[lang].parse(string).map(expressionFromJson),
    };
  } catch (e) {
    throw new ParseError(lang, string, e.name, e.location);
  }
};

const analyze = ({lang, expressions, string}) => {
  const expressionList = I.List(expressions);

  const identifiers = expressionList.flatMap(
    (expression) => collectIdentifiers(expression)
  ).toSet().toList();

  const subExpressions = expressionList.flatMap(
    (expression) => collectSubExpressions(expression)
      .reverse().toList()
  );

  const table = evaluateAll({
    expressions: subExpressions,
    identifiers,
  });

  return {
    lang,
    string,
    expressions: expressionList,
    identifiers,
    table,
    subExpressions,
  };
};

const handleError = (error) =>
  O.just({
    lang: error.lang,
    error: {
      location: error.location,
      name: error.name,
    },
    string: error.string,
  })
;

export default (actions) => {
  const parsed$ = actions.input$.startWith('').combineLatest(
    actions.language$.startWith('c'),
    (s, l) =>
      O.just({string: s, lang: l})
      .map(parse)
      .map(analyze)
      .catch(handleError)
  ).switch();

  return parsed$;
}
;
