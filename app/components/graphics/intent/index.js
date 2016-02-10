import {Observable as O} from 'rx';

const svgEventPosition = (() => {
  let oldPoint = null;
  return ({x,y}, svg) => {
    const pt = oldPoint || (oldPoint = svg.createSVGPoint());
    pt.x = x;
    pt.y = y;
    const result = pt.matrixTransform(svg.getScreenCTM().inverse());
    return result;
  };
})();

const touchCenter = (touchEvt) => ({
  x: Array.prototype.reduce.call(touchEvt.touches,
    (acc, t) => acc + t.pageX, 0
  ) / touchEvt.touches.length,
  y: Array.prototype.reduce.call(touchEvt.touches,
    (acc, t) => acc + t.pageY, 0
  ) / touchEvt.touches.length,
});

const touchDistance = (touchA, touchB) => {
  const dx = touchA.pageX - touchB.pageX;
  const dy = touchA.pageY - touchB.pageY;

  return Math.sqrt(dx * dx + dy * dy);
};

export default (DOM, globalEvents) => {
  const rootElement = DOM.select('.graphics-root');

  const panStart$ = O.amb(
    rootElement.events('mousedown')
      .map((evt) => ({pos: {x: evt.pageX, y: evt.pageY}, event: evt})),
    O.merge([
      rootElement.events('touchstart'),
      rootElement.events('touchend').filter((evt) => evt.touches.length > 0),
    ]).map((evt) => ({pos: touchCenter(evt), event: evt}))
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

  const pinchStart$ = rootElement
    .events('touchstart')
    .filter((evt) => evt.touches.length === 2);
  const pinchMove$ = globalEvents
    .events('touchmove');
  const pinchEnd$ = O.merge(
    globalEvents.events('touchend'),
    globalEvents.events('touchcancel')
  );

  const wheel$ = rootElement
    .events('wheel')
    .filter((evt) => !evt.altKey)
    .share();

  const pan$ = O.merge([
    panStart$
    .map((start) => ({
      pos: svgEventPosition({
        x: start.pos.x,
        y: start.pos.y,
      }, start.event.ownerTarget),
      svg: start.event.ownerTarget,
    }))
    .flatMapLatest((start) =>
      panMove$
      .map((move) => svgEventPosition({
        x: move.x,
        y: move.y,
      }, start.svg))
      .map((target) => ({
        x: target.x - start.pos.x,
        y: target.y - start.pos.y,
      }))
      .takeUntil(panEnd$)
    ),
  ]).share();

  const zoom$ = O.merge([
    wheel$
    .map((evt) => {
      const pivot = svgEventPosition({
        x: evt.clientX,
        y: evt.clientY,
      },
      evt.ownerTarget);
      const wheel = evt.deltaY / -40;
      const factor = Math.pow(
        1 + Math.abs(wheel) / 2,
        wheel > 0 ? 1 : -1
      );

      return {
        factor,
        pivot,
      };
    }).share(),
    pinchStart$
    .flatMapLatest((startEvt) =>
      pinchMove$
      .map((moveEvt) =>
      ({
        distance: touchDistance(moveEvt.touches[0], moveEvt.touches[1]),
        pivot: svgEventPosition(touchCenter(moveEvt), startEvt.ownerTarget),
      }))
      .scan((prev, current) => ({
        pivot: current.pivot,
        distance: current.distance,
        factor: current.distance / prev.distance,
      }), {
        distance: touchDistance(startEvt.touches[0], startEvt.touches[1]),
      })
      .takeUntil(pinchEnd$)
    ),
  ]).share();

  return {
    zoom$,
    pan$,
    preventDefault: O.merge([
      wheel$,
      panStart$.flatMapLatest(() =>
        panMove$
        .map((move) => move.event)
        .takeUntil(panEnd$)
      ),
    ]).share(),
  };
};
