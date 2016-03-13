import {Observable as O} from 'rx';

import {clamp} from '../../../lib/utils';
import {ContentThunk} from '../../../lib/contentThunk';

const zoomModifier = ({factor, pivot}, zoomLimit, bounds) => ({x, y, zoom}) => {
  const newZoom = clamp(zoom * factor, zoomLimit.min, zoomLimit.max);
  const realFactor = newZoom / zoom;
  const panFactor = (1 - 1 / realFactor);

  return {
    zoom: newZoom,
    x: clamp(x + (pivot.x - x) * panFactor, bounds.minX, bounds.maxX),
    y: clamp(y + (pivot.y - y) * panFactor, bounds.minY, bounds.maxY),
  };
};

const panModifier = (delta, bounds) => ({x, y, zoom}) => ({
  zoom,
  x: clamp(x - delta.x, bounds.minX, bounds.maxX),
  y: clamp(y - delta.y, bounds.minY, bounds.maxY),
});

const autoCenterModifier = (_, zoomLimit, bounds, {
  width, height, pivotX = 0.5, pivotY = 0,
}) => {
  const centerX = (bounds.maxX + bounds.minX) / 2;
  const centerY = (bounds.maxY + bounds.minY) / 2;
  const contentWidth = bounds.maxX - bounds.minX;
  const contentHeight = bounds.maxY - bounds.minY;
  const xRatio = (width - 20) / contentWidth;
  const zoom = xRatio;

  return () => ({
    x: centerX + (pivotX - 0.5) * contentWidth,
    y: centerY + (pivotY - 0.5) * contentHeight + height / 2 / zoom,
    zoom: clamp(zoom, zoomLimit.min, zoomLimit.max),
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
    (props, initCamera) => {
      const zoomLimit$ = bounds$.map((bounds) => ({
        min: Math.min(
          props.width / (bounds.maxX - bounds.minX),
          props.height / (bounds.maxY - bounds.minY),
          0.5
        ),
        max: 5,
      }));

      return O.merge([
        actions.zoom$.withLatestFrom(zoomLimit$, bounds$, zoomModifier),
        actions.pan$.withLatestFrom(bounds$, panModifier),
        forceBounds$.withLatestFrom(
          zoomLimit$, bounds$, props$, autoCenterModifier
        ),
      ])
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
      }));
    })
    .switch()
    .shareReplay(1);
};
