import {Observable as O} from 'rx';

export default ({DOM}) => {
  const inputField = DOM.select('.logic-input-field');
  const syntaxtSelector = DOM.select('.syntax-selector');
  const insertButton = DOM.select('[data-action-insert]');

  const changeEvent$ = inputField.events('input');
  const syntaxChangeEvent$ = syntaxtSelector.events('change');

  const insertButtonEvent$ = insertButton.events('click');

  const insertString$ = insertButtonEvent$
    .withLatestFrom(
      DOM.select('.logic-input-field').observable
      .filter((els) => els.length > 0),
      (evt, t) => ({
        element: t[0],
        string: evt.ownerTarget.dataset.actionInsert,
      })
    ).share();

  return {
    input$: changeEvent$
      .map((evt) => evt.ownerTarget.value)
      .share(),
    language$: syntaxChangeEvent$
      .map((evt) => evt.ownerTarget.value)
      .share(),

    insertString$: insertString$,

    preventDefault: O.merge([
      insertButton.events('mousedown'),
      insertButtonEvent$,
    ]),

    autoResize: changeEvent$
      .map((evt) => evt.ownerTarget)
      .share(),
  };
};
