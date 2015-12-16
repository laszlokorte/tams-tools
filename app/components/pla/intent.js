import {Observable as O} from 'rx';

import {preventDefault, stopPropagation} from '../../lib/utils';

export default (DOM) => {
  const rect = DOM.select('.test-rect');
  const rectRotate = DOM.select('.rotate-rect');

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

  const rotate$ = O.merge(
    rectRotate
      .events('click')
      .do(stopPropagation)
      .do(preventDefault)
      .ignoreElements(),
    rectRotate
      .events('mousedown')
      .do(preventDefault)
      .do(stopPropagation)
  );

  return {
    rotate$: rotate$.map(() => true),
    click$: click$.map(() => true),
  };
};
