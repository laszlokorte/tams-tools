import {Observable as O} from 'rx';

const zoomModifier = (zoom) => (pos) => ({
  x: pos.x + (zoom.pivot.x - pos.x) * (1 - 1 / zoom.factor),
  y: pos.y + (zoom.pivot.y - pos.y) * (1 - 1 / zoom.factor),
});

const panModifier = (delta) => (pos) => ({
  x: pos.x - delta.x,
  y: pos.y - delta.y,
});

export default (size$, cameraPosition$, cameraZoom$, actions) =>
  O.combineLatest(
    size$,
    cameraPosition$,
    cameraZoom$,
    (isize, iposition, izoom) =>
      O.combineLatest(
        O.merge(
          actions.zoom$.map(zoomModifier),
          actions.pan$.map(panModifier)
        ).scan((pos, modfn) => modfn(pos), iposition)
        .startWith(iposition),

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
