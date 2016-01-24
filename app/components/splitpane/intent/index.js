import {Observable as O} from 'rx';

const hammerPanOptions = (manager, Hammer) => {
  const pan = new Hammer.Pan({
    threshold: 0,
    pointers: 1,
    direction: Hammer.DIRECTION_HORIZONTAL,
  });
  manager.add(pan);
};

export default (DOM) => {
  const handle = DOM.select('.splitpane-handle');

  const panStart$ = handle
    .events('panstart', hammerPanOptions);
  const panMove$ = handle
    .events('panmove');
  const panEnd$ = handle
    .events('panend pancancel');

  const resize$ = handle.observable.skip(1).take(1).flatMap(() => panStart$
    .flatMapLatest(() =>
      panMove$
      .map((evt) => evt.center.x / evt.target.parentNode.clientWidth)
      .takeUntil(panEnd$)
    )
  ).share();

  return {
    resize$,

    preventDefault: O.empty(),
  };
};
