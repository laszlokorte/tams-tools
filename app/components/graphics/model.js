import {Observable as O} from 'rx';

export default (size$, cameraPosition$, cameraZoom$, actions) =>
  O.combineLatest(
    size$,
    cameraPosition$,
    cameraZoom$,
    (isize, iposition, izoom) =>
      actions.zoom$.scan(
        (prev, zoom) => prev * zoom.factor, izoom
      ).startWith(izoom).map(
        (zoom) => ({
          zoom,
          size: isize,
          position: iposition,
        })
      )
  ).switch()
;
