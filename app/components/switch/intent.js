import {Observable as O} from 'rx';

export default (DOM) => {
  const button = DOM.select('[data-switch-state]');
  const click$ = button.events('click');

  return {
    change$:
      click$
        .map((evt) =>
          evt.currentTarget.dataset.switchState === 'true'
        ),
    preventDefault: O.merge(
      click$,
      button.events('mousedown')
    ),
  };
};
