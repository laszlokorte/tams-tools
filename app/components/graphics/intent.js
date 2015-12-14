import {Observable as O} from 'rx';

import {preventDefault} from '../../lib/utils';

const svgEventPosition = (() => {
  let oldPoint = null;
  return ({x,y}, evt) => {
    const svg = evt.target.ownerSVGElement || evt.target;
    const pt = oldPoint || (oldPoint = svg.createSVGPoint());
    pt.x = x;
    pt.y = y;
    const result = pt.matrixTransform(svg.getScreenCTM().inverse());
    return result;
  };
})();

const hammerEventPosition = (evt) =>
  svgEventPosition(evt.center, evt.srcEvent)
;

const hammerPanOptions = (manager, Hammer) => {
  manager.add(new Hammer.Pan({
    direction: Hammer.DIRECTION_ALL,
  }));
};

const hammerPinchOptions = (manager, Hammer) => {
  manager.add(new Hammer.Pinch());
};

export default (DOM) => {
  const rootElement = DOM.select('.graphics-root');

  const panStart$ = rootElement
    .events('panstart', hammerPanOptions);
  const panEnd$ = rootElement
    .events('panend');
  const panMove$ = rootElement
    .events('panmove');

  const pinchStart$ = rootElement
    .events('pinchstart', hammerPinchOptions);
  const pinchMove$ = rootElement
    .events('pinchmove');
  const pinchEnd$ = rootElement
    .events('pinchend');

  const wheel$ = rootElement
    .events('wheel')
    .do(preventDefault);

  const pan$ = O.merge(
    panStart$
    .map(hammerEventPosition)
    .flatMap((start) =>
      panMove$
      .map(hammerEventPosition)
      .map((target) => ({
        x: target.x - start.x,
        y: target.y - start.y,
      }))
      .takeUntil(panEnd$)
    ),

    pinchStart$
      .map(hammerEventPosition)
      .flatMap((start) =>
        pinchMove$
        .map(hammerEventPosition)
        .map((target) => ({
          x: target.x - start.x,
          y: target.y - start.y,
        }))
        .takeUntil(pinchEnd$)
      )
  );

  const zoom$ = O.merge(
    wheel$
    .map((evt) => {
      const pivot = svgEventPosition({
        x: evt.clientX,
        y: evt.clientY,
      },
      evt);
      const wheel = evt.deltaY / -40;
      const factor = Math.pow(
        1 + Math.abs(wheel) / 2,
        wheel > 0 ? 1 : -1
      );

      return {
        factor,
        pivot,
      };
    }),
    pinchStart$
    .flatMap((startEvt) =>
      pinchMove$
      .map((moveEvt) =>
      ({
        factor: moveEvt.scale,
        pivot: svgEventPosition(moveEvt.center, moveEvt.srcEvent),
      }))
      .startWith({
        factor: startEvt.scale,
        prevFactor: startEvt.scale,
        pivot: svgEventPosition(startEvt.center, startEvt.srcEvent),
      })
      .scan(
        ({prevFactor}, {factor, pivot}) => ({
          factor: factor / prevFactor,
          prevFactor: factor,
          pivot,
        })
      )
      .takeUntil(pinchEnd$)
    )
  );

  return {
    zoom$,
    pan$,
  };
};
