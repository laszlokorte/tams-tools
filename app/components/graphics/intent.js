import {Observable as O} from 'rx';

import {preventDefault} from '../../lib/utils';

const svgEventPosition = (evt) => {
  const svg = evt.target.ownerSVGElement || evt.target;
  const pt = svg.createSVGPoint();
  pt.x = evt.clientX;
  pt.y = evt.clientY;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
};

export default (DOM) => {
  const mouseUp$ = O
    .fromEvent(document, 'mouseup')
    .do(preventDefault);
  const mouseMove$ = O
    .fromEvent(document, 'mousemove')
    .do(preventDefault);
  const mousedown$ = DOM
    .select('.graphics-root')
    .events('mousedown')
    .do(preventDefault)
    .map(svgEventPosition);

  const drag$ = mousedown$
    .flatMap((start) =>
      mouseMove$
      .map(svgEventPosition)
      .distinctUntilChanged()
      .map((target) => ({
        x: target.x - start.x,
        y: target.y - start.y,
      })
      ).takeUntil(mouseUp$)
    );

  return {
    zoom$:
      DOM
        .select('.graphics-root')
        .events('wheel')
        .do(preventDefault)
        .map((evt) => {
          const pivot = svgEventPosition(evt);
          const wheel = evt.deltaY / -40;
          const factor = Math.pow(1 + Math.abs(wheel) / 2 , wheel > 0 ? 1 : -1);

          return {
            factor,
            pivot,
          };
        }),
    pan$: drag$,
  };
};
