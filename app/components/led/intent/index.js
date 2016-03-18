import {Observable as O} from 'rx';

import panelActions from './panels';

export default ({DOM, selectIndex$}) => {
  const switchButton = DOM.select('.switch-button');
  const led = DOM.select('.led');
  const numberField = DOM.select('.number-field');

  const switchEvent$ = switchButton.events('click');
  const ledEvent$ = led.events('click');
  const inputEvent$ = numberField.events('input');

  const panels = panelActions({DOM});

  return {
    toggleSwitch$: switchEvent$.map(
      (evt) => parseInt(evt.ownerTarget.getAttribute('data-switch'), 10)
    ).share(),
    toggleOutput$: ledEvent$.map(
      (evt) => ({
        outputIndex: parseInt(evt.ownerTarget.getAttribute('data-led'), 10),
        reset: evt.altKey,
      })
    ).share(),
    decimalInput$: O.merge([
      inputEvent$.map(
        (evt) => parseInt(evt.ownerTarget.value, 10)
      ),
      selectIndex$.filter((i) => i !== null),
    ]).distinctUntilChanged().share(),

    panel$: panels.open$,

    preventDefault: panels.preventDefault,
  };
};
