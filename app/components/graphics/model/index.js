import {Observable as O} from 'rx';

import {clamp} from '../../../lib/utils';
import {ContentThunk} from '../../../lib/contentThunk';

const clampPosition = (modifierFn, {minX, minY, maxX, maxY}) =>
  (cam) => {
    const {x,y,zoom} = modifierFn(cam);
    return {
      zoom,
      x: clamp(x, minX, maxX),
      y: clamp(y, minY, maxY),
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

const autoCenterModifier = ({
  width, height, pivotX = 0.5, pivotY = 0,
}) => ({minX, minY, maxX, maxY}) => {
  const centerX = (maxX + minX) / 2;
  const centerY = (maxY + minY) / 2;
  const contentWidth = maxX - minX;
  const contentHeight = maxY - minY;
  const xRatio = (width - 20) / contentWidth;
  const zoom = xRatio;

  return () => ({
    x: centerX + (pivotX - 0.5) * contentWidth,
    y: centerY + (pivotY - 0.5) * contentHeight + height / 2 / zoom,
    zoom: clamp(zoom, 0.2, 5),
  });
};

export default ({
  props$, camera$, bounds$,
  content$, autoCenter$,
}, actions) => {
  const contentThunk$ = content$.map((content, index) => {
    return new ContentThunk(content, index % 2);
  });

  const forceBounds$ = autoCenter$
    .withLatestFrom(bounds$, (_,b) => b)
    .merge(bounds$.take(1));

  return O.combineLatest(
    props$,
    camera$,
    (props, initCamera) =>
      forceBounds$.flatMapLatest((bounds) =>
        O.merge([
          actions.zoom$.map(zoomModifier(Math.min(
            props.width / (bounds.maxX - bounds.minX),
            props.height / (bounds.maxY - bounds.minY),
            0.5
          ), 5)),
          actions.pan$.map(panModifier),
          forceBounds$.map(autoCenterModifier(props)),
        ]).map((mod) => clampPosition(mod, bounds))
        .startWith(({x, y, zoom}) => ({
          zoom,
          x: clamp(x, bounds.minX, bounds.maxX),
          y: clamp(y, bounds.minY, bounds.maxY),
        }))
      )
      .startWith({
        zoom: initCamera.zoom,
        x: initCamera.x,
        y: initCamera.y,
      })
      .scan((cam, modFn) => modFn(cam))
      .combineLatest(bounds$, contentThunk$, (cam, bounds, content) => ({
        width: props.width,
        height: props.height,
        camera: cam,
        bounds,
        content,
      }))
  ).switch();
};
