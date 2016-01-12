import {Observable as O} from 'rx';

export default (DOM, keydown) => {
  const switchButton = DOM.select('.switch-button');
  const led = DOM.select('.led');
  const numberField = DOM.select('.number-field');

  const switchEvent$ = switchButton.events('click');
  const ledEvent$ = led.events('click');
  const inputEvent$ = numberField.events('input');

  const exportButton = DOM.select('.export');

  return {
    toggleSwitch$: switchEvent$.map(
      (evt) => parseInt(evt.ownerTarget.getAttribute('data-switch'), 10)
    ).share(),
    cycleOutput$: ledEvent$.map(
      (evt) => parseInt(evt.ownerTarget.getAttribute('data-led'), 10)
    ).share().do(::console.log),
    decimalInput$: inputEvent$.map(
      (evt) => parseInt(evt.ownerTarget.value, 10)
    ).share(),
    export$: exportButton.events('click'),
    preventDefault: O.empty(),
  };
};
