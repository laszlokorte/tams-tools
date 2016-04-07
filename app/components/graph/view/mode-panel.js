import {div, ul, li, button} from '@cycle/dom';

import './mode-panel.styl';

import cursorIcon from '../../../icons/cursor';
import newNodeIcon from '../../../icons/new-node';
import moveIcon from '../../../icons/move';
import edgeIcon from '../../../icons/new-edge';
import autoLayoutIcon from '../../../icons/autolayout';

const MODES = [
  {
    id: 'view',
    name: 'View',
    icon: cursorIcon(32),
  },
  {
    id: 'create',
    name: 'Create Node',
    icon: newNodeIcon(32),
  },
  {
    id: 'connect',
    name: 'Connect Nodes',
    icon: edgeIcon(32),
  },
  {
    id: 'move',
    name: 'Move Node',
    icon: moveIcon(32),
  },
];

export default (state) =>
  state.mode === 'disabled' ? null :
  div('.mode-panel', [
    ul('.mode-list', [MODES.map((mode) =>
      li('.mode-list-item', [
        button('.mode-button' + (
          state.mode === mode.id ? '.state-active' : ''
        ), {
          title: mode.name,
          attributes: {
            'data-mode': mode.id,
          },
          disabled: state.mode === mode.id ? 'true' : void 0,
        }, mode.icon),
      ])
    ),
    li('.mode-list-item', [
      button('.mode-button', {
        title: 'Auto Layout',
        attributes: {
          'data-action': 'autolayout',
        },
      }, autoLayoutIcon(32)),
    ]),
    ]),
  ])
;
