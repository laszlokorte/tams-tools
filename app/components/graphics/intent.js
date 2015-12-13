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

const hammerPanOptions = (manager, Hammer) => {
  manager.add(new Hammer.Pan({
    direction: Hammer.DIRECTION_ALL,
  }));
};

const hammerPinchOptions = (manager, Hammer) => {
  manager.add(new Hammer.Pinch());
};

export default (DOM) => {
  const panStart$ = DOM
    .select('.graphics-root')
    .events('panstart', hammerPanOptions);
  const panEnd$ = DOM
    .select('.graphics-root')
    .events('panend');
  const panMove$ = DOM
    .select('.graphics-root')
    .events('panmove');

  const pinchStart$ = DOM
    .select('.graphics-root')
    .events('pinchstart', hammerPinchOptions);
  const pinchMove$ = DOM
    .select('.graphics-root')
    .events('pinchmove');
  const pinchEnd$ = DOM
    .select('.graphics-root')
    .events('pinchend');

  const pan$ = O.merge(
    panStart$
    .map((evt) => svgEventPosition(evt.center, evt.srcEvent))
    .flatMap((start) =>
      panMove$
      .map((evt) => svgEventPosition(evt.center, evt.srcEvent))
      .map((target) => ({
        x: target.x - start.x,
        y: target.y - start.y,
      }))
      .takeUntil(panEnd$)
    ),

    pinchStart$
      .map((evt) => svgEventPosition(evt.center, evt.srcEvent))
      .flatMap((start) =>
        pinchMove$
        .map((evt) => svgEventPosition(evt.center, evt.srcEvent))
        .map((target) => ({
          x: target.x - start.x,
          y: target.y - start.y,
        }))
        .takeUntil(pinchEnd$)
      )
  );

  return {
    zoom$:
      O.merge(
        DOM
          .select('.graphics-root')
          .events('wheel')
          .do(preventDefault)
          .map((evt) => {
            const pivot = svgEventPosition({
              x: evt.clientX,
              y: evt.clientY},
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
              pivot: svgEventPosition(startEvt.center, startEvt.srcEvent)
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
      ),
    pan$: pan$,
  };
};
