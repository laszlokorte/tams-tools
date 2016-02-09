import {Observable as O} from 'rx';

const touchCenter = (touchEvt) => ({
  x: Array.prototype.reduce.call(touchEvt.touches,
    (acc, t) => acc + t.pageX, 0
  ) / touchEvt.touches.length,
  y: Array.prototype.reduce.call(touchEvt.touches,
    (acc, t) => acc + t.pageY, 0
  ) / touchEvt.touches.length,
});

export default (DOM, globalEvents) => {
  const handle = DOM.select('.splitpane-handle');

  const panStart$ = O.amb(
    handle.events('mousedown'),
    handle.events('touchstart')
  );
  const panMove$ = O.amb(
    globalEvents.events('mousemove').map(({pageX: x, pageY: y}) => ({x, y})),
    globalEvents.events('touchmove').map((evt) => touchCenter(evt))
  );
  const panEnd$ = O.amb(
    globalEvents.events('mouseup'),
    O.merge(
      globalEvents.events('touchend'),
      globalEvents.events('touchcancel')
    )
  );

  const resize$ = handle.observable.skip(1).take(1).flatMap(() => panStart$
    .flatMapLatest((startEvt) =>
      panMove$
      .map((pos) => pos.x / startEvt.ownerTarget.parentNode.clientWidth)
      .takeUntil(panEnd$)
    )
  ).share();

  return {
    resize$,

    preventDefault: O.empty(),
  };
};
