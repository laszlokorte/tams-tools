import {Observable as O} from 'rx';

export default (DOM) => {
  const incButton = DOM.select('[data-increment]');
  const decButton = DOM.select('[data-decrement]');

  const incClick$ = incButton.events('click');
  const decClick$ = decButton.events('click');

  return {
    increment$:
      incClick$
      .map(() => true),
    decrement$:
      decClick$
      .map(() => true),
    preventDefault: O.merge(
      incClick$,
      decClick$,
      decButton.events('mousedown'),
      incButton.events('mousedown')
    ).share(),
  };
};
