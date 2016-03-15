import {Observable as O} from 'rx';

import {pan, zoom} from './gestures';

const svgEventPosition = (() => {
  let oldPoint = null;
  // a function transforming a given point into the coordinate
  // system of the given svg element
  return ({x,y}, svg) => {
    const pt = oldPoint || (oldPoint = svg.createSVGPoint());
    pt.x = x;
    pt.y = y;
    const result = pt.matrixTransform(svg.getScreenCTM().inverse());
    return result;
  };
})();

export default (DOM, globalEvents) => {
  const rootElement = DOM.select('.graphics-root');

  const panAction = pan(globalEvents, rootElement, svgEventPosition);
  const zoomAction = zoom(globalEvents, rootElement, svgEventPosition);

  return {
    zoom$: zoomAction.action$,
    pan$: panAction.action$,
    preventDefault: O.merge([
      zoomAction.preventDefault,
      panAction.preventDefault,
    ]).share(),
    stopPropagation: O.merge([
      zoomAction.stopPropagation,
      panAction.stopPropagation,
    ]).share(),
  };
};
