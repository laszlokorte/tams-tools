import {Observable as O} from 'rx';

export default (size$, cameraPosition$, cameraZoom$, actions) =>
  O.combineLatest(
    size$,
    cameraPosition$,
    cameraZoom$,
    (isize, iposition, izoom) =>
      O.combineLatest(
        actions.zoom$.scan(
          (prev, zoom) => ({
            x: prev.x + (zoom.pivot.x - prev.x) * (1 - 1 / zoom.factor),
            y: prev.y + (zoom.pivot.y - prev.y) * (1 - 1 / zoom.factor),
          }), iposition
        ).startWith(iposition),

        actions.zoom$.scan(
          (prev, zoom) => prev * zoom.factor, izoom
        ).startWith(izoom),

        (position, zoom) => ({
          zoom,
          size: isize,
          position,
        })
      )
  ).switch()
;
