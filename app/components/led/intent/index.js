import {Observable as O} from 'rx';

export default (DOM, keydown) => {
  const switchButton = DOM.select('.switch-button');

  const switchEvent$ = switchButton.events('click');

  return {
    switch$: switchEvent$.map(
      (evt) => evt.ownerTarget.dataset.inputId
    ).share(),
    preventDefault: O.empty(),
  };
};
