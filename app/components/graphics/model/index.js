import {Observable as O} from 'rx';

import {clamp} from '../../../lib/utils';
import {ContentThunk} from '../../../lib/contentThunk';

// create a function the zooms a camera state {x,y,zoom}
// by a factor round a pivot point {x, y}.
//
// the camera position is clamped to stay inside the bounds
// the zoom level is clamped to stay between the zoomLimit.
const zoomModifier =
({factor, pivot: {x: pivotX, y: pivotY}}, zoomLimit, bounds) =>
  ({x, y, zoom}) => {
    const newZoom = clamp(zoom * factor, zoomLimit.min, zoomLimit.max);
    const realFactor = newZoom / zoom;
    const panFactor = 1 - 1 / realFactor;

    return {
      zoom: newZoom,
      x: clamp(x + (pivotX - x) * panFactor, bounds.minX, bounds.maxX),
      y: clamp(y + (pivotY - y) * panFactor, bounds.minY, bounds.maxY),
    };
  };

// create a function the transforms a camera state {x, y, zoom}
// by a delta {x, y}.
//
// the camera position is clamped to stay inside the bounds
// the zoom level is clamped to stay between the zoomLimit.
const panModifier = (delta, bounds) => ({x, y, zoom}) => ({
  zoom,
  x: clamp(x - delta.x, bounds.minX, bounds.maxX),
  y: clamp(y - delta.y, bounds.minY, bounds.maxY),
});

// create a function the aligns a camera state {x, y, zoom}
// relative to a bounding box.
//
// weightX and weightY are number controling the camera alignment
// relative to the bounding box:
// 0.0:    align left/top border of the camera to left/top side of bounding
// 0.5: center cemera
// 1.0:   align right/bottom border of the camera to the
//      right/bottom side of the bounding
//
// the camera position is clamped to stay inside the bounds
// the zoom level is clamped to stay between the zoomLimit.
//
// width and height are the size of the stage.
const autoCenterModifier = (
  {weightX = 0.5, weightY = 0},
  zoomLimit, bounds,
  {width, height}
) => {
  const centerX = (bounds.maxX + bounds.minX) / 2;
  const centerY = (bounds.maxY + bounds.minY) / 2;
  const contentWidth = bounds.maxX - bounds.minX;
  const contentHeight = bounds.maxY - bounds.minY;
  const xRatio = (width - 20) / contentWidth;
  const zoom = xRatio;

  return () => ({
    x: clamp(
      centerX + (weightX - 0.5) * contentWidth,
      bounds.minX, bounds.maxX
    ),
    y: clamp(
      height / zoom / 2 +
      centerY + (weightY - 0.5) * contentHeight,
      bounds.minY, bounds.maxY
    ),
    zoom: clamp(zoom, zoomLimit.min, zoomLimit.max),
  });
};

export default ({
  props$, camera$, bounds$,
  content$, autoCenter$,
}, actions) => {
  // wrap the content stream in a thunk object
  // to prevent redundant virtual-dom diff calculations
  // (performance)
  const cachedContent$ = content$.map((content, index) => {
    return new ContentThunk(content, index % 2);
  });

  return O.combineLatest(
    props$,
    camera$,
    (props, initCamera) => {
      // the zoom limits depend on the relation of
      // bounds (size of the content) and the width/height props
      // (size of the stage)
      // so it's always possible to zoom out to see the whole content
      const zoomLimit$ = bounds$.map((bounds) => ({
        min: Math.min(
          props.width / (bounds.maxX - bounds.minX),
          props.height / (bounds.maxY - bounds.minY),
          0.5
        ),
        // upper zoom limit is currently just to a constant value
        // TODO(Laszlo Korte): come up with a sensible relationship?
        max: 5,
      }));

      return O.merge([
        actions.zoom$.withLatestFrom(
          zoomLimit$, bounds$, zoomModifier
        ),
        actions.pan$.withLatestFrom(
          bounds$, panModifier
        ),
        autoCenter$.withLatestFrom(
          zoomLimit$, bounds$, props$, autoCenterModifier
        ),
      ])
      .startWith({
        zoom: initCamera.zoom,
        x: initCamera.x,
        y: initCamera.y,
      })
      .scan((cam, modFn) => modFn(cam))
      .combineLatest(bounds$, cachedContent$, (cam, bounds, content) => ({
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
