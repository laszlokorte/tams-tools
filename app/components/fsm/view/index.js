import {div, ul, li, button} from '@cycle/dom';

import {TYPE_MOORE, TYPE_MEALY} from '../lib/state-machine';
import {attrBool} from '../../../lib/h-helper';

import renderMachine from './machine';

import settingsIcon from '../../../icons/settings';
import openIcon from '../../../icons/open';
import exportIcon from '../../../icons/export';
import helpIcon from '../../../icons/help';

import './index.styl';
const render = (state) => div('.app', [
  div('.app-head', [
    div('.action-panel', [
      div('.action-list', [
        div('.action-list-item', [
          button('.action-button', {
            attributes: {'data-panel': 'open'},
            title: 'Open Diagram...',
          }, openIcon(24)),
        ]),
        div('.action-list-item', [
          button('.action-button', {
            attributes: {'data-panel': 'save'},
            title: 'Export Diagram...',
          }, exportIcon(24)),
        ]),
        div('.action-list-item', [
          button('.action-button', {
            attributes: {'data-panel': 'settings'},
            title: 'Settings...',
          }, settingsIcon(24)),
        ]),
        div('.action-list-item', [
          button('.action-button', {
            attributes: {'data-panel': 'help'},
            title: 'Help...',
          }, helpIcon(24)),
        ]),
      ]),
    ]),

    ul('.fsm-edit-mode-list', [
      li('.fsm-edit-mode-list-item', [
        button('.fsm-edit-mode-button' +
        (state.currentEditMode === 'edit' ? '.state-active' : ''), {
          attributes: {
            disabled: attrBool(state.currentEditMode === 'edit'),
            'data-edit-mode': 'edit',
          },
        }, 'Edit'),
      ]),
      li('.fsm-edit-mode-list-item', [
        button('.fsm-edit-mode-button' +
        (state.currentEditMode === 'simulate' ? '.state-active' : ''), {
          attributes: {
            disabled: attrBool(state.currentEditMode === 'simulate'),
            'data-edit-mode': 'simulate',
          },
        }, 'Simulate'),
      ]),
    ]),

    ul('.fsm-type-list',
      state.currentEditMode === 'edit' ? [
        li('.fsm-type-list-item', [
          button('.fsm-type-button' +
          (state.fsm.type === TYPE_MOORE ? '.state-active' : ''), {
            attributes: {
              disabled: attrBool(state.fsm.type === TYPE_MOORE),
              'data-fsm-type': 'moore',
            },
          }, 'Moore'),
        ]),
        li('.fsm-type-list-item', [
          button('.fsm-type-button' +
          (state.fsm.type === TYPE_MEALY ? '.state-active' : ''), {
            attributes: {
              disabled: attrBool(state.fsm.type === TYPE_MEALY),
              'data-fsm-type': 'mealy',
            },
          }, 'Mealy'),
        ]),
      ] : [
        li(button('.fsm-type-button.state-readonly', {
          attributes: {
            disabled: true,
          },
        }, state.fsm.type === TYPE_MEALY ? 'Mealy' : 'Moore')),
      ]
    ),
  ]),
  renderMachine(state.fsm, state.currentEditMode === 'edit'),
])
;

export default (state$) =>
  state$.map(render)
;
