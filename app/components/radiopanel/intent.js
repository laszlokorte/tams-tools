import {Observable as O} from 'rx';

import {preventDefault} from '../../lib/utils';

export default (DOM) => {
  const buttons = DOM.select('[data-radio-state]');
  const click$ = O.merge(
    buttons.events('mousedown').do(preventDefault).ignoreElements(),
    buttons.events('click')
  );

  return {
    change$:
        click$
        .do(preventDefault)
        .map((evt) =>
          evt.target.dataset.radioState
        ),
  };
};
