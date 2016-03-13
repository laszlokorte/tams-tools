import {Observable as O} from 'rx';

export default (DOM, globalEvents) => {
  const closeEvent$ = O.merge([
    DOM
      .select('[data-modal-close]')
      .events('click'),
    globalEvents.events('keydown').filter((evt) => evt.keyCode === 27),
  ]);

  return {
    close$:
      closeEvent$
        .map(() => true),
    preventDefault: closeEvent$,
  };
};
