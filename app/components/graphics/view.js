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

const renderBounds = ({minX, maxX, minY, maxY}) =>
  svg('rect', {
    attributes: {
      x: minX,
      y: minY,
      width: (maxX - minX),
      height: (maxY - minY),
      class: 'graphics-camera-bounds',
    },
  })
;

const renderGrid = ({minX, maxX, minY, maxY}) => [
  svg('defs', [
    svg('pattern', {
      attributes: {
        id: 'smallGrid',
        width: '10',
        height: '10',
        patternUnits: 'userSpaceOnUse',
      },
    }, [
      svg('path', {
        attributes: {
          d: 'M 10 0 L 0 0 0 10',
          class: 'graphics-grid graphics-grid-small',
        },
      }),
    ]),
    svg('pattern', {
      attributes: {
        id: 'grid',
        width: '100',
        height: '100',
        patternUnits: 'userSpaceOnUse',
      },
    }, [
      svg('rect', {
        attributes: {
          width: '100',
          height: '100',
          fill: 'url(#smallGrid)',
        },
      }),
      svg('path', {
        attributes: {
          d: 'M 100 0 L 0 0 0 100',
          class: 'graphics-grid graphics-grid-large',
        },
      }),
    ]),
  ]),
  svg('rect', {
    attributes: {
      x: minX,
      y: minY,
      width: (maxX - minX),
      height: (maxY - minY),
      class: 'graphics-grid-container',
      fill: 'url(#grid)',
    },
  }),
];

const render = ({width, height, camera, bounds, content}) =>
  div('.graphics-container', [
    svg('svg', {
      attributes: {
        width: width,
        height: height,
        class: 'graphics-root',
        viewBox:
          viewbox(width, height,
            camera),
        preserveAspectRatio: 'xMidYMid meet',
      },
    }, [
      renderBackground(width, height, camera),
      renderBounds(bounds),
      renderGrid(bounds),
      svg('g', {attributes: {class: 'graphics-content'}},
        content),
    ]),
  ])
;

export default (state$) =>
  state$.map(render)
;
