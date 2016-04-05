import {Observable as O} from 'rx';

// TODO(laszlo): use gesture detection of graphics component
//
// The graphics component already defines a solid gesture detection
// for drag gestures. We do not need to rebuild the touch event
// handling here.

// the center of all touches of the given touch event
const touchCenter = (target, touchEvt) => {
  const touches = Array.prototype.filter.call(
    touchEvt.touches, (t) => t.target === target
  );

  return {
    x: Array.prototype.reduce.call(touches,
      (acc, t) => acc + t.pageX, 0
    ) / (touches.length || 1),
    y: Array.prototype.reduce.call(touches,
      (acc, t) => acc + t.pageY, 0
    ) / (touches.length || 1),
  };
};

export default (DOM, globalEvents) => {
  const handle = DOM.select('.splitpane-handle');

  // use either mousedown or touchstart events
  // whatever occurs first.
  const panStart$ = O.amb(
    handle.events('mousedown'),
    handle.events('touchstart')
  );

  // use either mousemove or touchmove events
  // whatever occurs first.
  const panMove$ = O.amb(
    globalEvents.events('mousemove').map((evt) => ({
      x: evt.pageX,
      y: evt.pageY,
      event: evt,
    })),
    globalEvents.events('touchmove').withLatestFrom(
      handle.observable,
      (evt, target) => {
        const center = touchCenter(target[0], evt);
        return {
          x: center.x,
          y: center.y,
          event: evt,
        };
      }
    )
  );

  // use either mouseup or touchend/touchcancel events
  // whatever occurs first.
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
      .map(
        // the proportional horizontal position of the pointer
        // inside the splitpane container
        (pos) => pos.x / startEvt.ownerTarget.parentNode.clientWidth
      )
      .takeUntil(panEnd$)
    ).switch();

  return {
    // the proportional position of the devider
    // a stream of values between 0.0 and 1.0
    resize$,

    preventDefault: panStart$.map((start) =>
      panMove$
      .map((move) => move.event)
      .startWith(start)
      .takeUntil(panEnd$)
    ).switch().share(),
  };
};
