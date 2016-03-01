import {Observable as O} from 'rx';
import I from 'immutable';

import {
  contextFromLabeledExpressions,
} from '../lib/context';

import {
  C, Python, Latex, Math,
} from './languages';

import parser from './parser';

const languages = {
  c: C,
  latex: Latex,
  math: Math,
  python: Python,
};

const languageList = Object
  .keys(languages)
  .map((id) => ({
    id: id,
    language: languages[id],
  }));

const analyze = ({
  language,
  langId, expressions,
  string, showSubExpressions,
}) => {
  try {
    const context = contextFromLabeledExpressions(expressions);

    return {
      language,
      langId,
      string,
      context,
      showSubExpressions,
    };
  } catch (e) {
    return {
      language,
      langId,
      string,
      error: e,
      showSubExpressions,
    };
  }
};

const handleError = (error) =>
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
        .map(parser(languages))
        .map(analyze)
        .catch(handleError)
        .map(({
          language,
          error,
          formatter,
          context,
        }) => ({
          languageList,
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
