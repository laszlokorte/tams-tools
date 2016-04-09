import {Observable as O} from 'rx';
import {
  div, span, ul, li, button, h2,
  input, dl, dt, dd, label,
} from '@cycle/dom';

import {TYPE_MOORE, TYPE_MEALY} from '../lib/state-machine';
import {attrBool} from '../../../lib/h-helper';

import renderMachine from './machine';

import openIcon from '../../../icons/open';
import exportIcon from '../../../icons/export';
import helpIcon from '../../../icons/help';
import tickIcon from '../../../icons/tick';

import './index.styl';

const renderStateOutputValues = (stateIndex, fsm) =>
  fsm.outputs.map((output, outputIndex) => [
    dt('.property-panel-list-titel', [
      span('.property-panel-label', output.name),
    ]),
    dd('.property-panel-list-value', [
      fsm.type === TYPE_MOORE ?
      [
        label('.property-checkbox-field', [
          input({
            type: 'radio',
            name: `state-${stateIndex}-out-${outputIndex}`,
            value: 'false',
          }),
          'On',
        ]),
        label('.property-checkbox-field', [
          input({
            type: 'radio',
            name: `state-${stateIndex}-out-${outputIndex}`,
            value: 'true',
          }),
          'Off',
        ]),
      ] :
      input('.property-panel-field.small', {
        attributes: {
          'data-state-index': stateIndex,
          'data-state-output-index': outputIndex,
        },
        value: '',
      }),
    ]),
  ]).toArray()
;

const renderStateProperties = (fsm, stateIndex) => [
  span('.property-panel-label', 'Name'),
  input('.property-panel-field', {
    attributes: {
      'data-state-name': stateIndex,
    },
    value: fsm.states.get(stateIndex) ?
      fsm.states.get(stateIndex).name : '',
  }),
  span('.property-panel-headline', 'Output values'),
  dl('.property-panel-list',
    renderStateOutputValues(stateIndex, fsm)
  ),
];

const renderTransitionProperties = (fsm, fromIndex, toIndex) => {
  const transition = fsm.states.get(fromIndex).transitions
      .filter((t) => t.target === toIndex).first();

  return [
    div('.property-panel-info', `From ${
      fsm.states.get(fromIndex) ?
        fsm.states.get(fromIndex).name : '?'
    } to ${
      fsm.states.get(toIndex) ?
        fsm.states.get(toIndex).name : '?'
    }`),
    span('.property-panel-label', 'Condition'),
    input('.property-panel-field', {
      attributes: {
        'data-transition-condition': `${fromIndex}-${toIndex}`,
      },
      value: transition ? transition.condition : '?',
    }),
  ];
};

const renderPropertyPanel = (state, selection) =>
  selection === null ? null :
  div('.property-panel-overlay', [
    div('.property-panel', [
      button('.property-panel-close-button', {
        attributes: {
          'data-property-action': 'close',
        },
      }, [
        tickIcon(24),
      ]),
      div('.property-panel-body', [
        h2('.property-panel-title',
          selection.type === 'node' ? 'State' : 'Transition'
        ),
        selection.type === 'node' ?
        renderStateProperties(state.fsm, selection.value) :
        renderTransitionProperties(
          state.fsm, selection.value.fromIndex, selection.value.toIndex
        ),
      ]),
    ]),
  ])
;

const render = (state, selection) => div('.app', [
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
  renderPropertyPanel(state, selection),
])
;

export default (state$, selection$, panels$) =>
  O.combineLatest(state$, selection$, panels$,
    (state, selection, panels) =>
      div([
        panels,
        render(state, selection),
      ])
  )
;
