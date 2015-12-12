import {div} from '@cycle/dom';
import svg from '../../lib/monkeypatches/svg';

import './view.styl';

const viewbox = (width, height, camera) =>
  `${camera.x - width / 2 / camera.zoom}
   ${camera.y - height / 2 / camera.zoom}
   ${width / camera.zoom}
   ${height / camera.zoom}`
;

const renderBackground = (width, height, camera) =>
  svg('rect', {
    attributes: {
      x: camera.x - width / camera.zoom / 2,
      y: camera.y - height / camera.zoom / 2,
      width: width / camera.zoom,
      height: height / camera.zoom,
      class: 'graphics-background',
    },
  })
;

const renderBounds = ({min, max}) =>
  svg('rect', {
    attributes: {
      x: min,
      y: min,
      width: (max - min),
      height: (max - min),
      class: 'graphics-camera-bounds',
    },
  })
;

const renderOrigin = () =>
  svg('circle', {
    attributes: {
      cx: 0,
      cy: 0,
      r: 5,
      class: 'graphics-origin',
    },
  })
;

const renderCircle = (x, y, radius) =>
  svg('circle', {
    attributes: {
      cx: x,
      cy: y,
      r: radius,
      class: 'graphics-debug',
    },
  })
;

const render = ({width, height, camera, bounds, content$}) =>
  div('.graphics-container', [
    svg('svg', {
      attributes: {
        width: width,
        height: height,
        class: 'graphics-root',
        viewBox:
          viewbox(width, height,
            camera),
      },
    }, [
      renderBackground(width, height,
            camera),
      renderBounds(bounds),
      renderOrigin(),
      svg('g', {attributes: {class: 'graphics-content'}},
        content$),
    ]),
  ])
;

export default (state$) =>
  state$.map(render)
;
