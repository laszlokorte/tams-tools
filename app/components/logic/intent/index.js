import {Observable as O} from 'rx';

import panelActions from './panels';

export default (DOM/*, keydown*/) => {
  const inputField = DOM.select('.logic-input-field');
  const syntaxtSelector = DOM.select('.syntax-selector');
  const subExpressionCheckbox = DOM.select('input[name="subexpressions"]');
  const tableRow = DOM.select('tr[data-index]');

  const changeEvent$ = inputField.events('input');
  const syntaxChangeEvent$ = syntaxtSelector.events('change');
  const subExprEvent$ = subExpressionCheckbox.events('change');
  const rowEvent$ = tableRow.events('mousedown');

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
    selectRow$: rowEvent$
      .map((evt) => parseInt(evt.ownerTarget.dataset.index, 10))
      .share(),

    panel$: panels.open$,

    preventDefault: O.merge(
      panels.preventDefault
    ),
    autoResize: changeEvent$
      .map((evt) => evt.ownerTarget)
      .share(),
  };
};
