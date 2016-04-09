import {div, ul, li, button} from '@cycle/dom';

import './mode-panel.styl';

import {IF} from '../../../lib/h-helper';

import cursorIcon from '../../../icons/cursor';
import newNodeIcon from '../../../icons/new-node';
import deleteNodeIcon from '../../../icons/delete-node';
import moveIcon from '../../../icons/move';
import newEdgeIcon from '../../../icons/new-edge';
import deleteEdgeIcon from '../../../icons/delete-edge';
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
    icon: newEdgeIcon(32),
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
      ])),
      li('.mode-list-item', [
        button('.mode-button', {
          title: 'Auto Layout',
          attributes: {
            'data-action': 'autolayout',
          },
        }, autoLayoutIcon(32)),
      ]),

      IF(state.selection !== null, () => [
        IF(state.selection.type === 'edge', () =>
          li('.mode-list-item-secondary', [
            button('.mode-button.danger', {
              title: 'Remove Edge',
              attributes: {
                'data-remove-edge': `${
                  state.selection.value.fromIndex
                }-${
                  state.selection.value.toIndex
                }`,
              },
            }, deleteEdgeIcon(32)),
          ])
        ),
        IF(state.selection.type === 'node', () =>
          li('.mode-list-item-secondary', [
            button('.mode-button.danger', {
              title: 'Remove Node',
              attributes: {
                'data-remove-node': state.selection.value,
              },
            }, deleteNodeIcon(32)),
          ])
        ),
      ]),
    ]),
  ])
;
