import {Observable as O} from 'rx';
import I from 'immutable';

// This file contains the logic for recognizing
// pan and pinch gestures from touch events.

const ownerElement = (rootElement) =>
  rootElement.observable
  .map((e) => e[0])
  .distinctUntilChanged(
    (e) => e,
    (a, b) => a === b
  ).shareReplay(1)
;

// get the id of the given touch
const touchId = (touch) => touch.identifier;

// http://stackoverflow.com/a/12737882/1533291
const isPrimaryMouseButton = (event) => {
  if ('buttons' in event) {
    return event.buttons === 1;
  } else if ('which' in event) {
    return event.which === 1;
  } else {
    return event.button === 1;
  }
};

// get a stream of current touch ids
const toucheIds = (globalEvents, rootElement) => O.merge([
  rootElement.events('touchstart').map(
    (e) => (ids) => ids.union(
      Array.prototype.map.call(e.changedTouches, touchId)
    )
  ),
  globalEvents.events('touchend').map(
    (e) => (ids) => ids.subtract(
      Array.prototype.map.call(e.changedTouches, touchId)
    )
  ),
]).scan(
  (ids, modFn) => modFn(ids),
  I.Set()
).distinctUntilChanged(
  (e) => e,
  (a, b) => a === b
).share();

// get the center point of the given touches
const touchCenter = (touches) => {
  const length = touches.length;
  const center = Array.prototype.reduce.call(touches, (sum, touch) => ({
    x: sum.x + touch.pageX / length,
    y: sum.y + touch.pageY / length,
  }), {x: 0, y: 0});

  return center;
};

// get the avarage radius of the touches around their center
const touchRadius = (touches) => {
  const length = touches.length;
  const {x,y} = touchCenter(touches);

  return touches.reduce((sum, touch) =>
    sum +
    Math.sqrt(
      Math.pow(touch.pageX - x, 2) +
      Math.pow(touch.pageY - y, 2)
    )
  , 0) / length;
};

// Return only the touches with the given ids.
const filterTouches = (ids, touches) =>
  Array.prototype.filter.call(
    touches,
    (touch) => ids.contains(touch.identifier)
  )
;

// get the zoom factor for the given wheel event
const wheelFactor = (wheelEvent) => {
  const wheel = wheelEvent.deltaY / -40;
  return Math.pow(
    1 + Math.abs(wheel) / 2,
    wheel > 0 ? 1 : -1
  );
};

// transforms touch event streams into a pinch action stream
const touchZoom = ({
  pinchStart$, // stream of touch ids that start a zoom
  pinchMove$, // stream of touch move events
  pinchEnd$, // stream of touch ids that end a zoom
  owner$, // stream containing the owner element of the events
  positionFn, // function transforming event coordinates into world coorinates
}) =>
  pinchStart$
  .map((ids) =>
    pinchMove$
    .withLatestFrom(owner$, (moveEvt, owner) => {
      const touches = filterTouches(ids, moveEvt.touches);
      const {x, y} = positionFn(touchCenter(touches), owner);
      return {
        distance: touchRadius(touches),
        pivot: {x, y},
        factor: 1,
      };
    })
    .scan((prev, current) => ({
      pivot: current.pivot,
      distance: current.distance,
      factor: current.distance / prev.distance,
    }))
    .takeUntil(pinchEnd$)
    .share()
  ).switch()
;

// transforms mouse wheel events into pinch/zoom events
const wheelZoom = ({
  wheel$, // stream of mouse events
  owner$, // stream containing the owner element
  positionFn, // function transforming event coordinates into world coorinates
}) =>
  wheel$.withLatestFrom(owner$, (evt, owner) => {
    const pivot = positionFn({
      x: evt.pageX,
      y: evt.pageY,
    }, owner);

    const factor = wheelFactor(evt);

    return {
      factor,
      pivot,
    };
  }).share()
;

// interpret drag and touch events as pinch/zoom
//
// returns {action$, stopPropagation, preventDefault}
// action$ - a stream containing the pinch/zoom gestures
// stopPropagation - a stream containing the processed events
// preventDefault - a stream containing the event's that default
//                  behavior should be canceled
export const zoom = (
  globalEvents, // the globalEvent driver source
  rootElement, // DOM source on which the pinch/zoom should be recognized
  positionFn // function translation event positions
             // into world coordinate system
) => {
  const owner$ = ownerElement(rootElement);

  const touches$ = toucheIds(globalEvents, rootElement);
  const pinchStart$ = touches$.filter((ids) => ids.size >= 2);
  const pinchEnd$ = touches$.filter((ids) => ids.size < 2);

  const wheel$ = rootElement.events('wheel')
    .filter((evt) => !evt.altKey)
    .share();

  const pinchMove$ = globalEvents
    .events('touchmove');

  const touchAction$ = touchZoom({
    pinchStart$, pinchMove$, pinchEnd$,
    owner$, positionFn,
  });

  const wheelAction$ = wheelZoom({wheel$, owner$, positionFn});

  return {
    action$: O.merge([
      touchAction$,
      wheelAction$,
    ]).share(),
    stopPropagation: O.empty(),
    preventDefault: wheel$,
  };
};

// transforms touch event streams into a panning action stream
const touchPan = ({
  touchChange$, // stream of touch start end touch end events
  panStart$, // stream of touch ids that start a pan
  panMove$, // stream of touch move events
  panEnd$, // stream of touch ids that stop a pan
  owner$, // stream containing the event's owner element
  positionFn, // function translation event positions
              // into world coordinate system
}) =>
  panStart$
  .withLatestFrom(touchChange$, owner$, (ids, initial, owner) => {
    const {x: startX, y: startY} = positionFn(
      touchCenter(filterTouches(ids, initial.touches)), owner
    );
    return panMove$.map((move) => positionFn(
      touchCenter(filterTouches(ids, move.touches)),
      owner
    ))
    .map((target) => ({
      x: target.x - startX,
      y: target.y - startY,
    }))
    .takeUntil(panEnd$)
    .share();
  }).switch()
;

const mousePan = ({
  mouseDown$,
  mouseMove$,
  mouseUp$,
  owner$,
  positionFn,
}) =>
  mouseDown$
  .withLatestFrom(owner$, (downEvt, owner) => {
    const {x: startX, y: startY} = positionFn(
      {x: downEvt.pageX, y: downEvt.pageY}, owner
    );
    return mouseMove$.map((move) => positionFn(
      {x: move.pageX, y: move.pageY},
      owner
    ))
    .map((target) => ({
      x: target.x - startX,
      y: target.y - startY,
    }))
    .takeUntil(mouseUp$)
    .share();
  }).switch()
;

// interpret drag and touch events as panning
//
// returns {action$, stopPropagation, preventDefault}
// action$ - a stream containing the pan gestures
// stopPropagation - a stream containing the processed events
// preventDefault - a stream containing the event's that default
//                  behavior should be canceled
export const pan = (
  globalEvents, // the globalEvent driver source
  rootElement, // DOM source on which the panning should be recognized
  positionFn // function translation event positions
             // into world coordinate system
) => {
  const owner$ = ownerElement(rootElement);

  const touchChange$ = O.merge([
    rootElement.events('touchstart'),
    globalEvents.events('touchend'),
  ]).share();

  const touches$ = toucheIds(globalEvents, rootElement);
  const panStart$ = touches$.filter((ids) => ids.size > 0);
  const panEnd$ = touches$.filter((ids) => ids.size <= 0);
  const panMove$ = globalEvents.events('touchmove');

  const mouseDown$ = rootElement.events('mousedown')
    .filter(isPrimaryMouseButton);
  const mouseMove$ = globalEvents.events('mousemove');
  const mouseUp$ = globalEvents.events('mouseup');

  const touchAction$ = touchPan({
    touchChange$, panStart$, panMove$, panEnd$, owner$, positionFn,
  });

  const mouseAction$ = mousePan({
    mouseDown$, mouseMove$, mouseUp$, owner$, positionFn,
  });

  const preventDefault = O.merge([
    panStart$.map(() =>
      panMove$.takeUntil(panEnd$)
    ).switch(),
    mouseDown$.map(() =>
      mouseMove$.takeUntil(mouseUp$)
    ).switch(),
  ]).share();

  return {
    action$: O.merge([
      touchAction$,
      mouseAction$,
    ]).share(),
    stopPropagation: O.empty(),
    preventDefault,
  };
};
