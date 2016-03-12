import {Observable as O} from 'rx';
import I from 'immutable';

const owner = (rootElement) =>
  rootElement.observable
  .map((e) => e[0])
  .distinctUntilChanged(
    (e) => e,
    (a, b) => a === b
  )
;

// get the id of the given touch
const touchId = (touch) => touch.identifier;

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
).distinctUntilChanged().share();

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

const touchZoom = ({
  pinchStart$, pinchMove$, pinchEnd$, owner$, positionFn,
}) =>
  pinchStart$
  .map((ids) =>
    pinchMove$
    .withLatestFrom(owner$, (moveEvt, ownerElement) => {
      const touches = filterTouches(ids, moveEvt.touches);
      const {x, y} = positionFn(touchCenter(touches), ownerElement);
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
  ).switch()
;

const wheelZoom = ({wheel$, owner$, positionFn}) =>
  wheel$.withLatestFrom(owner$, (evt, ownerElement) => {
    const pivot = positionFn({
      x: evt.pageX,
      y: evt.pageY,
    }, ownerElement);

    const factor = wheelFactor(evt);

    return {
      factor,
      pivot,
    };
  }).share()
;

// interpret touch and scroll events as pinch
export const zoom = (globalEvents, rootElement, positionFn) => {
  const owner$ = owner(rootElement);

  const touches$ = toucheIds(globalEvents, rootElement);
  const pinchStart$ = touches$.filter((ids) => ids.size === 2);
  const pinchEnd$ = touches$.filter((ids) => ids.size !== 2);

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
    ]),
    stopPropagation: O.empty(),
    preventDefault: wheel$,
  };
};

const touchPan = ({
  touchChange$, panStart$, panMove$, panEnd$, owner$, positionFn,
}) =>
  panStart$
  .withLatestFrom(touchChange$, owner$, (ids, initial, ownerElement) => {
    const {x: startX, y: startY} = positionFn(
      touchCenter(filterTouches(ids, initial.touches)), ownerElement
    );
    return panMove$.map((move) => positionFn(
      touchCenter(filterTouches(ids, move.touches)),
      ownerElement
    ))
    .map((target) => ({
      x: target.x - startX,
      y: target.y - startY,
    }))
    .takeUntil(panEnd$);
  }).switch()
;

const mousePan = ({
  mouseDown$, mouseMove$, mouseUp$, owner$, positionFn,
}) =>
  mouseDown$
  .withLatestFrom(owner$, (downEvt, ownerElement) => {
    const {x: startX, y: startY} = positionFn(
      {x: downEvt.pageX, y: downEvt.pageY}, ownerElement
    );
    return mouseMove$.map((move) => positionFn(
      {x: move.pageX, y: move.pageY},
      ownerElement
    ))
    .map((target) => ({
      x: target.x - startX,
      y: target.y - startY,
    }))
    .takeUntil(mouseUp$);
  }).switch()
;

// interpret drag and touch events as pan
export const pan = (globalEvents, rootElement, positionFn) => {
  const owner$ = owner(rootElement);

  const touchChange$ = O.merge([
    rootElement.events('touchstart'),
    globalEvents.events('touchend'),
  ]);
  const touches$ = toucheIds(globalEvents, rootElement);
  const panStart$ = touches$.filter((ids) => ids.size > 0);
  const panEnd$ = touches$.filter((ids) => ids.size <= 0);
  const panMove$ = globalEvents.events('touchmove');

  const mouseDown$ = rootElement.events('mousedown');
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
  ]);

  return {
    action$: O.merge([touchAction$, mouseAction$]),
    stopPropagation: O.empty(),
    preventDefault,
  };
};
