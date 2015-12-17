import {Observable as O} from 'rx';

export default (DOM) => {
  const rect = DOM.select('.test-rect');

  const click$ = O.merge(
    rect
      .events('tap', (manager, Hammer) => {
        manager.add(new Hammer.Tap());
      })
  );

  return {
    click$: click$.map(() => true),
  };
};
