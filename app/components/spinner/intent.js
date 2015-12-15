import {Observable as O} from 'rx';

import {preventDefault} from '../../lib/utils';

export default (DOM) => {
  const incButton = DOM.select('[data-increment]');
  const decButton = DOM.select('[data-decrement]');

  const incClick$ = O.merge(
    incButton.events('mousedown').do(preventDefault).ignoreElements(),
    incButton.events('click').do(preventDefault)
  );
  const decClick$ = O.merge(
    decButton.events('mousedown').do(preventDefault).ignoreElements(),
    decButton.events('click').do(preventDefault)
  );

  return {
    increment$:
      incClick$
      .map(() => true),
    decrement$:
      decClick$
      .map(() => true),
  };
};
