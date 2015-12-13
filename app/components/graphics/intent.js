import {Observable as O} from 'rx';

import {preventDefault} from '../../lib/utils';

const svgEventPosition = (evt, svg_) => {
  const svg = svg_ || evt.target.ownerSVGElement || evt.target;
  const pt = svg.createSVGPoint();
  pt.x = evt.pageX;
  pt.y = evt.pageY;
  const result = pt.matrixTransform(svg.getScreenCTM().inverse());
  return result;
};

const hammerOptions = (manager, Hammer) => {
  // Default pan recognizer.
  manager.add(new Hammer.Pan());
  // Default tap recognizer.
  manager.get(`pan`).set({direction: Hammer.DIRECTION_ALL});
};

export default (DOM) => {
  const mousedown$ = DOM
    .select('.graphics-root')
    .events('panstart', hammerOptions)
    .map((evt) => ({
      start: svgEventPosition(evt.srcEvent),
      svg: evt.target.ownerSVGElement || evt.target,
    }));
  const mouseUp$ = DOM
    .select('.graphics-root')
    .events('panend');
  const mouseMove$ = DOM
    .select('.graphics-root')
    .events('panmove');

  const drag$ = mousedown$
    .flatMap(({start, svg}) =>
      mouseMove$
      .map((evt) => svgEventPosition(evt.srcEvent, svg))
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
