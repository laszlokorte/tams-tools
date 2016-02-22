import {div, span, ul, li, h3, button, input as inputElement} from '@cycle/dom';

import {TYPE_MOORE, TYPE_MEALY} from '../lib/state-machine';

import renderMachine from './machine';

import './index.styl';
const render = (state) => div([
  ul([
    li([
      button({
        attributes: {
          disabled: state.currentEditMode === 'edit' || void 0,
          'data-edit-mode': 'edit',
        },
      }, 'Edit'),
    ]),
    li([
      button({
        attributes: {
          disabled: state.currentEditMode === 'simulate' || void 0,
          'data-edit-mode': 'simulate',
        },
      }, 'Simulate'),
    ]),
  ]),

  state.currentEditMode === 'edit' ?
  ul([
    li([
      button({
        attributes: {
          disabled: state.fsm.type === TYPE_MOORE || void 0,
          'data-fsm-type': 'moore',
        },
      }, 'Moore'),
    ]),
    li([
      button({
        attributes: {
          disabled: state.fsm.type === TYPE_MEALY || void 0,
          'data-fsm-type': 'mealy',
        },
      }, 'Mealy'),
    ]),
  ]) : void 0,

  renderMachine(state.fsm, state.currentEditMode === 'edit'),
])
;

export default (state$) =>
  state$.map(render)
;
