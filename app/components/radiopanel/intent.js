import {Observable as O} from 'rx';

export default (DOM) => {
  const buttons = DOM.select('[data-radio-state]');
  const click$ = buttons.events('click');

  return {
    change$:
        click$
        .map((evt) =>
          evt.currentTarget.dataset.radioState
        ),
    preventDefault: O.merge(
      click$,
      buttons.events('mousedown')
    ),
  };
};
