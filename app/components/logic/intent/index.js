import {Observable as O} from 'rx';

export default (DOM/*, keydown*/) => {
  const inputField = DOM.select('.logic-input-field');
  const syntaxtSelector = DOM.select('.syntax-selector');
  const subExpressionCheckbox = DOM.select('input[name="subexpressions"]');

  const changeEvent$ = inputField.events('input');
  const syntaxChangeEvent$ = syntaxtSelector.events('change');
  const subExprEvent$ = subExpressionCheckbox.events('change');

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
    preventDefault: O.empty(),
  };
};
