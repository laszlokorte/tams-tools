import {div, svg} from '@cycle/dom';

import './index.styl';

// create the viewbox string
const viewbox = (width, height, camera) =>
  `${camera.x - width / 2 / camera.zoom}
   ${camera.y - height / 2 / camera.zoom}
   ${width / camera.zoom}
   ${height / camera.zoom}`
;

// create a rectangle covering the whole element
const renderBackground = (width, height, camera) =>
  svg('rect', {
    attributes: {
      x: ~~(0.5 + camera.x - width / camera.zoom / 2),
      y: ~~(0.5 + camera.y - height / camera.zoom / 2),
      width: ~~(0.5 + width / camera.zoom),
      height: ~~(0.5 + height / camera.zoom),
      class: 'graphics-background',
    },
  })
;

// create a rectange of size of the bounds
const renderBounds = ({minX, maxX, minY, maxY}) =>
  svg('rect', {
    attributes: {
      x: ~~(0.5 + minX),
      y: ~~(0.5 + minY),
      width: ~~(0.5 + maxX - minX),
      height: ~~(0.5 + maxY - minY),
      class: 'graphics-camera-bounds',
    },
  })
;

// create the background grid
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
      x: ~~(0.5 + minX),
      y: ~~(0.5 + minY),
      width: ~~(0.5 + maxX - minX),
      height: ~~(0.5 + maxY - minY),
      class: 'graphics-grid-container',
      fill: 'url(#grid)',
    },
  }),
];

// create the graphics container
const render = ({width, height, camera, bounds, content}) =>
  div('.graphics-container', [
    svg('svg', {
      attributes: {
        width: ~~(0.5 + width),
        height: ~~(0.5 + height),
        class: 'graphics-root',
        viewBox:
          viewbox(width, height,
            camera),
        preserveAspectRatio: 'xMidYMin meet',
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
