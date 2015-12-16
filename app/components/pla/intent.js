import {Observable as O} from 'rx';

import {preventDefault, stopPropagation} from '../../lib/utils';

export default (DOM) => {
  const rect = DOM.select('.test-rect');
  const rectRotate = DOM.select('.rotate-rect');

  const click$ = O.merge(
    rect
      .events('tap', (manager, Hammer) => {
        manager.add(new Hammer.Tap());
      })
  );

  const rotate$ = O.merge(
    rectRotate
      .events('tap', (manager, Hammer) => {
        manager.add(new Hammer.Tap());
      })
  );

  return {
    rotate$: rotate$.map(() => true),
    click$: click$.map(() => true),
  };
};
