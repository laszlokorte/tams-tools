import {Observable as O} from 'rx';

import {clamp} from '../../lib/utils';

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
  const yRatio = (height - 20) / contentHeight;
  const zoom = xRatio;

  return () => ({
    x: centerX + (pivotX - 0.5) * contentWidth,
    y: centerY + (pivotY - 0.5) * contentHeight + height / 2 / zoom,
    zoom,
  });
};

const ContentThunk = function thunkConstructor(node, key) {
  this.node = node;
  this.key = key;
};
ContentThunk.prototype.type = "Thunk";
ContentThunk.prototype.render = function thunkRender(previous) {
  if (!previous || previous.key !== this.key) {
    return this.node;
  } else {
    return previous.vnode;
  }
};

export default ({props$, camera$, bounds$, content$}, actions) => {
  const contentThunk$ = content$.map((content, index) => {
    return new ContentThunk(content, index % 2);
  });

  return O.combineLatest(
    props$,
    camera$,
    (props, initCamera) =>
      bounds$
      .distinctUntilChanged(
        (a) => a,
        (a,b) => a.minX === b.minX && a.maxX === b.maxX &&
          a.minY === b.minY && a.maxY === b.maxY
      )
      .flatMapLatest((bounds) =>
        O.merge(
          actions.zoom$.map(zoomModifier(0.2, 5)),
          actions.pan$.map(panModifier),
          bounds$.map(autoCenterModifier(props))
        ).map((mod) => clampPosition(mod, bounds))
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
