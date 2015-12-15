import {Observable as O} from 'rx';

import {clamp} from '../../lib/utils';

const clampPosition = (modifierFn, min, max) =>
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

export default ({props$, camera$, bounds$, content$}, actions) =>
  O.combineLatest(
    props$,
    camera$,
    (props, initCamera) =>
      bounds$.flatMapLatest((bounds) =>
        O.merge(
          actions.zoom$.map(zoomModifier(0.2, 5)),
          actions.pan$.map(panModifier)
        ).map((mod) => clampPosition(mod, bounds.min, bounds.max))
        .startWith(({x, y, zoom}) => ({
          zoom,
          x: clamp(x, bounds.min, bounds.max),
          y: clamp(y, bounds.min, bounds.max),
        }))
      )
      .startWith({
        zoom: initCamera.zoom,
        x: initCamera.x,
        y: initCamera.y,
      })
      .scan((cam, modFn) => modFn(cam))
      .combineLatest(bounds$, content$, (cam, bounds, content) => ({
        width: props.width,
        height: props.height,
        camera: cam,
        bounds,
        content,
      }))
  ).switch()
;
