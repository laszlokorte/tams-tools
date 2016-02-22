import {div, ul, li, button} from '@cycle/dom';

import {TYPE_MOORE, TYPE_MEALY} from '../lib/state-machine';
import {attrBool} from '../../../lib/h-helper';

import renderMachine from './machine';

import './index.styl';
const render = (state) => div([
  ul([
    li([
      button({
        attributes: {
          disabled: attrBool(state.currentEditMode === 'edit'),
          'data-edit-mode': 'edit',
        },
      }, 'Edit'),
    ]),
    li([
      button({
        attributes: {
          disabled: attrBool(state.currentEditMode === 'simulate'),
          'data-edit-mode': 'simulate',
        },
      }, 'Simulate'),
    ]),
  ]),

  ul([
    state.currentEditMode === 'edit' ?
    li([
      button({
        attributes: {
          disabled: attrBool(state.fsm.type === TYPE_MOORE),
          'data-fsm-type': 'moore',
        },
      }, 'Moore'),
      button({
        attributes: {
          disabled: attrBool(state.fsm.type === TYPE_MEALY),
          'data-fsm-type': 'mealy',
        },
      }, 'Mealy'),
    ]) :
    li(state.fsm.type.name),
  ]),

  renderMachine(state.fsm, state.currentEditMode === 'edit'),
])
;

export default (state$) =>
  state$.map(render)
;
