import {Observable as O} from 'rx';

export default ({DOM, selectIndex$}) => {
  const switchButton = DOM.select('.switch-button');
  const led = DOM.select('.led');
  const numberField = DOM.select('.number-field');

  const switchEvent$ = switchButton.events('click');
  const ledEvent$ = led.events('click');
  const inputEvent$ = numberField.events('input');

  return {
    toggleSwitch$: switchEvent$.map(
      (evt) => parseInt(evt.ownerTarget.getAttribute('data-switch'), 10)
    ).share(),
    cycleOutput$: ledEvent$.map(
      (evt) => parseInt(evt.ownerTarget.getAttribute('data-led'), 10)
    ).share(),
    decimalInput$: O.merge([
      inputEvent$.map(
        (evt) => parseInt(evt.ownerTarget.value, 10)
      ),
      selectIndex$.filter((i) => i !== null),
    ]).distinctUntilChanged().share(),
    preventDefault: O.empty(),
  };
};
