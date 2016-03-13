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
    globalEvents.events('mousemove').map((evt) => ({
      x: evt.pageX,
      y: evt.pageY,
      event: evt,
    })),
    globalEvents.events('touchmove').map((evt) => {
      const center = touchCenter(evt);
      return {
        x: center.x,
        y: center.y,
        event: evt,
      };
    })
  );
  const panEnd$ = O.amb(
    globalEvents.events('mouseup'),
    O.merge(
      globalEvents.events('touchend'),
      globalEvents.events('touchcancel')
    )
  );

  const resize$ =
    panStart$
    .map((startEvt) =>
      panMove$
      .map((pos) => pos.x / startEvt.ownerTarget.parentNode.clientWidth)
      .takeUntil(panEnd$)
    ).switch();

  return {
    resize$,

    preventDefault: panStart$.map(() =>
      panMove$
      .map((move) => move.event)
      .takeUntil(panEnd$)
    ).switch().share(),
  };
};
