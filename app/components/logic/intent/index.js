import {Observable as O} from 'rx';

import panelActions from './panels';

export default ({DOM, openData$}) => {
  const inputField = DOM.select('.logic-input-field');
  const syntaxtSelector = DOM.select('.syntax-selector');
  const subExpressionCheckbox = DOM.select('input[name="subexpressions"]');
  const formatSelect = DOM.select('.format-select');

  const changeEvent$ = inputField.events('input');
  const syntaxChangeEvent$ = syntaxtSelector.events('change');
  const subExprEvent$ = subExpressionCheckbox.events('change');

  const selectFormatEvent$ = formatSelect.events('change');

  const panels = panelActions({DOM});

  return {
    input$: changeEvent$
      .map((evt) => evt.ownerTarget.value)
      .share(),
    language$: syntaxChangeEvent$
      .map((evt) => evt.ownerTarget.value)
      .share(),
    showSubExpressions$: subExprEvent$
      .map((evt) => evt.ownerTarget.checked)
      .share(),

    panel$: panels.open$,

    openExpression$: openData$,

    selectFormat$: selectFormatEvent$
      .map((evt) => evt.ownerTarget.value)
      .share(),

    preventDefault: O.merge([
      panels.preventDefault,
    ]),
    autoResize: changeEvent$
      .map((evt) => evt.ownerTarget)
      .share(),
  };
};
