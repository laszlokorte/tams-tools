import {Observable as O} from 'rx';

export default (DOM, keydown) => {
  const inputField = DOM.select('.logic-input-field');

  const changeEvent$ = inputField.events('input');

  return {
    input$: changeEvent$
      .map((evt) => evt.ownerTarget.value)
      .startWith('(P&Q)&(R&S&T)')
      .share(),
    preventDefault: O.empty(),
  };
};
