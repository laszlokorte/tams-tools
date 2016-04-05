import {div, ul, li, button} from '@cycle/dom';

import './mode-panel.styl';

const MODES = [
  {
    id: 'view',
    name: 'View',
  },
  {
    id: 'create',
    name: 'Create',
  },
  {
    id: 'move',
    name: 'Move',
  },
  {
    id: 'connect',
    name: 'Connect',
  },
];

export default (state) =>
  div('.mode-panel', [
    ul('.mode-list', MODES.map((mode) =>
      li('.mode-list-item', [
        button('.mode-button' + (
          state.mode === mode.id ? '.state-active' : ''
        ), {
          attributes: {
            'data-mode': mode.id,
          },
          disabled: state.mode === mode.id ? 'true' : void 0,
        }, mode.name),
      ])
    )),
  ])
;
