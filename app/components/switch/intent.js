import {Observable as O} from 'rx';

import {preventDefault} from '../../lib/utils';

export default (DOM) => {
  const button = DOM.select('[data-switch-state]');
  const click$ = O.merge(
    button.events('mousedown').do(preventDefault).ignoreElements(),
    button.events('click')
  );

  return {
    change$:
      click$
        .do(preventDefault)
        .map((evt) =>
          evt.target.dataset.switchState === 'true'
        ),
  };
};
