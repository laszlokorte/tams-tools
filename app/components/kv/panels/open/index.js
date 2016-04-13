import {Observable as O} from 'rx';
import isolate from '@cycle/isolate';
import {wrapInDiv} from '../../../../lib/dom-helper';

import LogicField from '../../../logic/input-field';

import ModalBox from '../../../modal';
import intent from './intent';
import view from './view';
import model from './model';

export default ({DOM, globalEvents, visible$}) => {
  const {isolateSource, isolateSink} = DOM;
  const isolatedDOM = isolateSource(DOM, 'modalBody');

  const logicField = isolate(LogicField, 'logic-field')({
    DOM: isolatedDOM,
    props$: O.just({showCompletion: false}),
  });
  const expression$ = logicField.output$;

  const actions = intent({
    DOM: isolatedDOM,
    expression$,
  });
  const state$ = model(visible$, expression$, actions);
  const modal = isolate(ModalBox, 'modal')({
    DOM,
    globalEvents,
    props$: state$.map(({props}) => props),
    content$: isolateSink(view(state$, logicField.DOM), 'modalBody'),
  });

  return {
    DOM: modal.DOM.map(wrapInDiv),
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
