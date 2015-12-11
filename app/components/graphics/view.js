import {div, svg} from '@cycle/dom';

import './view.styl';

const viewbox = (width, height, x, y, zoom) =>
  `${x - width / 2 / zoom}
   ${y - height / 2 / zoom}
   ${width / zoom}
   ${height / zoom}`
;

const renderBackground = (width, height, x, y, zoom) =>
  svg('rect', {
    attributes: {
      x: x - width / zoom / 2,
      y: y - height / zoom / 2,
      width: width / zoom,
      height: height / zoom,
      class: 'graphics-background',
    }
  })
;

const renderCircle = (x, y, radius) =>
  svg('circle', {
    attributes: {
      cx: x,
      cy: y,
      r: radius,
      fill: 'red',
    },
  })
;

const render = ({size, position, zoom}) =>
  div('.graphics-container', [
    svg('svg', {
      attributes: {
        width: size.width,
        height: size.height,
        class: 'graphics-root',
        viewBox:
          viewbox(size.width, size.height,
            position.x, position.y, zoom),
      },
    }, [
      renderBackground(size.width, size.height,
            position.x, position.y, zoom),
      renderCircle(0,0, 20),
    ]),
  ])
;

export default (state$) =>
  state$.map(render)
;
