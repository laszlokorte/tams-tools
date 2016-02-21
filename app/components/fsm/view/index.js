import {div, span, ul, li, h3, button, input as inputElement} from '@cycle/dom';

import {TYPE_MOORE, TYPE_MEALY} from '../lib/state-machine';

import renderMachine from './machine';

import './index.styl';

const renderInput = (input, index, editable) =>
  li([
    [
      inputElement({type: 'checkbox', checked: input.initialValue})
    ],
    span(`${input.name}`),
    editable ? button({attributes: {
      'data-fsm-remove-input': index,
    }}, 'Delete') : void 0,
  ])
;

const renderOutput = (output, index, editable) =>
  li([
    span(`${output.name}`),
    editable ? button({attributes: {
      'data-fsm-remove-output': index,
    }}, 'Delete') : void 0,
  ])
;

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
  ]) :
  button({
    attributes: {
      'data-fsm-action': 'tick',
    },
  }, 'Tick'),

  h3('Inputs'),
  state.currentEditMode === 'edit' ? button({
    attributes: {
      'data-fsm-action': 'add-input',
    },
  }, 'Add Input') : void 0,
  ul('.input-list', state.fsm.inputs.map(
    (input, index) => renderInput(
      input, index,
      state.currentEditMode === 'edit'
    )
  ).toArray()),
  h3('Outputs'),
  state.currentEditMode === 'edit' ? button({
    attributes: {
      'data-fsm-action': 'add-output',
    },
  }, 'Add Output') : void 0,
  ul('.output-list', state.fsm.outputs.map(
    (output, index) => renderOutput(
      output, index,
      state.currentEditMode === 'edit'
    )
  ).toArray()),
  renderMachine(state.fsm),
])
;

export default (state$) =>
  state$.map(render)
;
