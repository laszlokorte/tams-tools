import {Observable as O} from 'rx';

export default (DOM, keydown) => {
  const closeEvent$ = O.merge(
    DOM
      .select('[data-modal-close]')
      .events('click'),
    keydown.filter((evt) => evt.keyCode === 27)
  );

  return {
    close$:
      closeEvent$
        .map(() => true),
    preventDefault: closeEvent$,
  };
};
