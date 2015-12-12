import {Observable as O} from 'rx';

import {preventDefault} from '../../lib/utils';

const svgEventPosition = (evt, svg_) => {
  const svg = svg_ || evt.target.ownerSVGElement || evt.target;
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
    .map((evt) => ({
      start: svgEventPosition(evt),
      svg: evt.target.ownerSVGElement || evt.target,
    }));

  const drag$ = mousedown$
    .flatMap(({start, svg}) =>
      mouseMove$
      .map((evt) => svgEventPosition(evt, svg))
      .distinctUntilChanged(
        (v) => v,
        (a, b) => a.x === b.x && a.y === b.y
      )
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
