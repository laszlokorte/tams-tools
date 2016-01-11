import {div, svg} from '@cycle/dom';

import './index.styl';

const render = (state) =>
  div([
    svg('svg', {
      attributes: {
        width: 400,
        height: 400,
        class: 'graphics-root',
        viewBox: '0 0 400 200',
        preserveAspectRatio: 'xMidYMin meet',
      },
    }, [
      svg('circle', {
        cx: 20,
        cy: 20,
        r: 15,
        fill: 'black',
      }),
      svg('g', {
        transform: 'translate(100, 100)',
      }, [
        svg('path', {
          d: 'M17.75,12.5l10.5,-10.5l73.5,0l10.5,10.5l-10.5,10.5l-73.5,0l-10.5,-10.5Z',
          fill: 'green',
        }),
        svg('path', {
          d: 'M12.5,17.75l10.5,10.5l0,73.5l-10.5,10.5l-10.5,-10.5l0,-73.5l10.5,-10.5Z',
          fill: 'green',
        }),
        svg('path', {
          d: 'M117.5,17.75l10.5,10.5l0,73.5l-10.5,10.5l-10.5,-10.5l0,-73.5l10.5,-10.5Z',
          fill: 'green',
        }),
        svg('path', {
          d: 'M17.75,117.5l10.5,-10.5l73.5,0l10.5,10.5l-10.5,10.5l-73.5,0l-10.5,-10.5Z',
          fill: 'green',
        }),
        svg('path', {
          d: 'M12.5,122.75l10.5,10.5l0,73.5l-10.5,10.5l-10.5,-10.5l0,-73.5l10.5,-10.5Z',
          fill: 'green',
        }),
        svg('path', {
          d: 'M117.5,122.75l10.5,10.5l0,73.5l-10.5,10.5l-10.5,-10.5l0,-73.5l10.5,-10.5Z',
          fill: 'green',
        }),
        svg('path', {
          d: 'M17.75,222.5l10.5,-10.5l73.5,0l10.5,10.5l-10.5,10.5l-73.5,0l-10.5,-10.5Z',
          fill: 'green',
        }),
      ]),
    ]),
  ])
;

export default (state$) =>
  state$.map(render)
;
