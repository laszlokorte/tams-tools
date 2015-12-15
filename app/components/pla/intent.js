import {Observable as O} from 'rx';

import {preventDefault, stopPropagation} from '../../lib/utils';

export default (DOM) => {
  const rect = DOM.select('.test-rect');

  const click$ = O.merge(
    rect
      .events('click')
      .do(stopPropagation)
      .do(preventDefault)
      .ignoreElements(),
    rect
      .events('mousedown')
      .do(preventDefault)
      .do(stopPropagation)
  );

  return {
    click$: click$.map(() => true),
  };
};
