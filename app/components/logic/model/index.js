import {Observable as O} from 'rx';
import I from 'immutable';

import {
  expressionFromJson,
  collectIdentifiers,
  collectSubExpressions,
  evaluateAll,
} from '../lib/expression';

import cParser from '../lib/syntax/logic-c.jison';
import javaParser from '../lib/syntax/logic-java.jison';
import latexParser from '../lib/syntax/logic-latex.jison';
import mathParser from '../lib/syntax/logic-math.jison';
import pythonParser from '../lib/syntax/logic-python.jison';

const parsers = {
  c: cParser,
  java: javaParser,
  latex: latexParser,
  math: mathParser,
  python: pythonParser,
};

function ParseError(string, error) {
  this.string = string;
  this.error = error;
};

export default (actions) => {
  const parsed$ = actions.input$.combineLatest(
    actions.language$.startWith('c'),
    (string, lang) => {
      try {
        return {
          string,
          expressions: parsers[lang].parse(string).map(expressionFromJson),
        };
      } catch (e) {
        console.log(e);
        throw new ParseError(string, e.hash);
      }
    }
  )
    .map(({expressions, string}) => {
      const expressionList = I.List(expressions);
      const identifiers = expressionList.flatMap(
        (expression) => collectIdentifiers(expression)
      ).toSet().toList();

      const subExpressions = expressionList.flatMap(
          (expression) => collectSubExpressions(expression)
            .reverse().toList()
      );
      const table = evaluateAll({expressions: subExpressions, identifiers});
      return {
        string,
        expressions: expressionList,
        identifiers: identifiers,
        table,
        subExpressions,
      };
    })
  ;

  const c = (e) =>
    O.just({
      error: e.error,
      string: e.string,
    })
      .concat(parsed$).catch(c)
  ;

  return parsed$.catch(c)
    .startWith(null)
    ;
}
;