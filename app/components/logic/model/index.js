import {Observable as O} from 'rx';
import I from 'immutable';

import {
  expressionFromJson,
} from '../lib/expression';

import {
  contextFromLabeledExpression,
} from '../lib/context';

import cParser from '../lib/syntax/logic-c.pegjs';
import latexParser from '../lib/syntax/logic-latex.pegjs';
import mathParser from '../lib/syntax/logic-math.pegjs';
import pythonParser from '../lib/syntax/logic-python.pegjs';

const completions = {
  c: ['&','|','^','~','1','0'],
  python: ['and','or','xor','not','true','false'],
  latex: ['\\wedge','\\vee','\\oplus','\\neg','\\top','\\bot'],
  math: ['∧','∨','⊕','¬','⊤','⊥'],
};

function ParseError({lang, string, message, location, detected = null}) {
  this.lang = lang;
  this.string = string;
  this.message = message;
  this.location = location;
  this.detected = detected;
};

const _language = I.Record({
  name: null,
  parse: () => { throw new Error("not implemented"); },
});

const cLang = _language({
  name: 'C',
  parse: (string) => {
    return {
      lang: 'c',
      parsed: cParser.parse(string),
    };
  },
});

const latexLang = _language({
  name: 'Latex',
  parse: (string) => {
    return {
      lang: 'latex',
      parsed: latexParser.parse(string),
    };
  },
});

const pythonLang = _language({
  name: 'Python',
  parse: (string) => {
    return {
      lang: 'python',
      parsed: pythonParser.parse(string),
    };
  },
});

const mathLang = _language({
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

const autoLang = _language({
  name: 'Auto detect',
  parse: (string) => {
    let error = null;
    let detected = null;
    for (const lang of allLanguages) {
      try {
        const result = lang.parse(string);
        return {
          parsed: result.parsed,
          lang: 'auto',
          detected: lang.name,
        };
      } catch (e) {
        if (!error) {
          detected = lang.name;
          error = e;
        } else if (
          e.location.start.offset >
          error.location.start.offset
        ) {
          detected = lang.name;
          error = e;
        }
      }
    }

    throw new ParseError({
      lang: 'auto',
      string,
      message: error.message,
      location: error.location,
      detected,
    });
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
    throw new ParseError({
      lang, string,
      message: e.message,
      location: e.location,
      detected: e.detected,
    });
  }
};

const analyze = ({lang, detected, expressions, string, showSubExpressions}) => {
  const context = contextFromLabeledExpression(expressions);

  return {
    lang,
    detected,
    string,
    context,
    showSubExpressions,
  };
};

const handleError = (error) =>
  O.just({
    lang: error.lang,
    detected: error.detected,
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
    language: 'auto',
    term: '',
  })
  .flatMapLatest(({language, term}) =>
    O.combineLatest(
      actions.input$.startWith(term),
      actions.language$.startWith(language),
      actions.selectFormat$.startWith('math'),
      actions.showSubExpressions$.startWith(false),
      (string, lang, outputFormat, showSubExpressions) =>
        O.just({
          string,
          lang,
          detected: null,
          showSubExpressions,
        })
        .map(parse)
        .map(analyze)
        .catch(handleError)
        .map(({
          detected,
          error,
          formatter,
          context,
        }) => ({
          detected,
          lang,
          string,
          error,
          context,
          formatter,
          showSubExpressions,
          outputFormat,
          completions: completions[
            (detected && detected.toLowerCase()) || lang
          ] || [],
        }))
    ).switch()
  );

  return parsed$.share();
}
;
