import {Observable as O} from 'rx';
import I from 'immutable';

import {
  C, Python, Latex, Math,
} from './languages';

import parser from './parser';
import {postProcess} from './post-processor';

import {
  input as _input,
  output as _output,
  error as _error,
} from './io';

const LANGUAGE_MAP = {
  c: C,
  latex: Latex,
  math: Math,
  python: Python,
};

const _state = I.Record({
  languageList: I.List(),
  input: null,
  output: null,
  showCompletion: true,
}, 'state');

const languageList = I.List(Object
  .keys(LANGUAGE_MAP)
  .map((id) => ({
    id: id,
    language: LANGUAGE_MAP[id],
  })));

const handleError = (parseError) =>
  O.just(_output({
    network: null,
    language: parseError.language,
    error: _error({
      location: parseError.location,
      message: parseError.message,
    }),
  }))
;

const processInput = (input) => {
  return O.just(input)
  .map(parser(LANGUAGE_MAP))
  .map(postProcess)
  .map((analysisResult) => _output({
    language: analysisResult.language,
    network: analysisResult.network,
    error: analysisResult.error,
  }))
  .catch(handleError);
};

export default (props$, initalExpression$, actions) =>
  initalExpression$
  .map((string) => JSON.parse(string))
  .startWith({term: '', langId: 'auto'})
  .map((initial) =>
    O.combineLatest(
      O.combineLatest(
        actions.input$.startWith(initial.term),
        actions.language$.startWith(initial.langId),
        (term, langId) => _input({string: term, langId})
      ),
      props$,
      (input, props) =>
        processInput(input)
        .map((output) =>
          _state({
            input,
            output: output,
            languageList,
            showCompletion: props.showCompletion,
          })
        )
    ).switch()
  ).switch()
  .shareReplay(1)
;
