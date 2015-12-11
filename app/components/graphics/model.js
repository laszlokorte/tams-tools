import {Observable as O} from 'rx';

import {clamp} from '../../lib/utils';

const clampPositionDecorator = (min, max) => (modifierFn) =>
  (cam) => {
    const {x,y,zoom} = modifierFn(cam);
    return {
      zoom,
      x: clamp(x, min, max),
      y: clamp(y, min, max),
    };
  }
;

const zoomModifier = (min, max) => ({factor, pivot}) => ({x, y, zoom}) => {
  const newZoom = clamp(zoom * factor, min, max);
  const realFactor = newZoom / zoom;
  const panFactor = (1 - 1 / realFactor);

  return {
    zoom: newZoom,
    x: x + (pivot.x - x) * panFactor,
    y: y + (pivot.y - y) * panFactor,
  };
};

const panModifier = (delta) => ({x, y, zoom}) => ({
  zoom,
  x: x - delta.x,
  y: y - delta.y,
});

export default (size$, cameraPosition$, cameraZoom$, actions) =>
  O.combineLatest(
    size$,
    cameraPosition$,
    cameraZoom$,
    (initSize, initPosition, initZoom) =>
      O.merge(
        actions.zoom$.map(zoomModifier(0.3, 3)),
        actions.pan$.map(panModifier)
      )
      .map(clampPositionDecorator(-500, 500))
      .startWith({
        zoom: initZoom,
        x: initPosition.x,
        y: initPosition.y,
      })
      .scan((cam, modFn) => modFn(cam))
      .map((cam) => ({
        size: initSize,
        camera: cam,
      }))
  ).switch()
;
