import {div, svg} from '@cycle/dom';

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

const renderCircle = (x, y, radius) =>
  svg('circle', {
    attributes: {
      cx: x,
      cy: y,
      r: radius,
      class: 'graphics-debug'
    },
  })
;

const render = ({width, height, camera}) =>
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
      renderCircle(0,0, 20),
    ]),
  ])
;

export default (state$) =>
  state$.map(render)
;
