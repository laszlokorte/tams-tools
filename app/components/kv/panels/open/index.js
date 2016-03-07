import {Observable as O} from 'rx';
import isolate from '@cycle/isolate';
import {div} from '@cycle/dom';

import LogicField from '../../../logic/input-field';

import ModalBox from '../../../modal';
import intent from './intent';
import view from './view';
import model from './model';

export default ({DOM, keydown, visible$}) => {
  const {isolateSource, isolateSink} = DOM;
  const isolatedDOM = isolateSource(DOM, 'modalBody');

  const logicField = isolate(LogicField)({
    DOM: isolatedDOM,
    props$: O.just({showCompletion: false}),
  });
  const expression$ = logicField.output$;

  const actions = intent({
    DOM: isolatedDOM,
    expression$,
  });
  const state$ = model(visible$, expression$, actions);
  const modal = isolate(ModalBox)({
    DOM,
    keydown,
    props$: state$.map(({props}) => props),
    content$: isolateSink(view(state$, logicField.DOM), 'modalBody'),
  });

  return {
    DOM: modal.DOM.map((e) => div([e])),
    preventDefault: O.merge([
      actions.preventDefault,
      logicField.preventDefault,
    ]),
    data$: actions.open$,
    expression$: actions.importExpression$,
    autoResize: logicField.autoResize,
    insertString: logicField.insertString,
  };
};
