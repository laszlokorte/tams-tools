import {Observable as O} from 'rx';

import {
  div, button ,span, ul, li,
} from '@cycle/dom';

import {
  renderTable,
} from './table';

import './index.styl';

const renderInputSpinner = (state) =>
  div('.input-spinner' + (
      state.currentEditMode !== 'function' ? '.state-readonly' : ''
  ), [
    span('.input-spinner-label', 'Inputs'),
    span('.input-spinner-value', state.diagram.inputs.size.toString()),
    span('.input-spinner-buttons', [
      button('.input-spinner-button-decrement', {
        attributes: {'data-kv-counter': 'decrement'},
        disabled: state.diagram.inputs.size < 1,
      }, 'Decrement'),
      button('.input-spinner-button-increment', {
        attributes: {'data-kv-counter': 'increment'},
        disabled: state.diagram.inputs.size >= 8,
      }, 'Increment'),
    ]),
  ])
;

const renderLoopIcon = (loop, index, editable) =>
  li('.loop-list-item', [
    span('.loop-icon', {
      style: {
        backgroundColor: loop.color,
      },
    }, [
      button('.loop-button-delete', {
        attributes: {
          'data-loop-index': index,
        },
        disabled: !editable,
      }, "Delete"),
    ]),
  ])
;

const renderModeButton = (state) => {
  const modeName = state.currentKvMode.name;
  return div('.loop-mode-switch', [
    ul('.loop-mode-options', [
      li('.loop-mode-options-item', [
        button('.loop-mode' +
          (modeName === 'dnf' ? '.state-active' : '')
        , {
          attributes: {'data-kv-mode': 'dnf'},
        }, 'DNF'),
      ]),
      li('.loop-mode-options-item', [
        button('.loop-mode' +
          (modeName === 'knf' ? '.state-active' : '')
        , {
          attributes: {'data-kv-mode': 'knf'},
        }, 'KNF'),
      ]),
    ]),
  ]);
};

const renderLoopList = (state, editable) =>
  div('.loop-bar' + (editable ? '' : '.state-faded'), [
    renderModeButton(state),
    ul('.loop-list',
      state.diagram.loops
      .filter((loop) => loop.mode === state.currentKvMode)
      .isEmpty() ?
      [li('.loop-list-item-empty', 'Keine Loops')] :
      state.diagram.loops
      .map((loop, index) => ({loop, index}))
      .filter(({loop}) => loop.mode === state.currentKvMode)
      .map(({loop, index}) =>
        renderLoopIcon(loop, index, editable)
      ).toArray()
    ),
  ])
;

const renderOutputThumbnails = (layout, state, {canEdit, canAdd, canRemove}) =>
  div('.output-panel', [
    ul('.output-list',
      state.diagram.outputs.map((output, i) =>
      li('.output-list-item' +
      (i === state.currentOutput ? '.state-current' : ''), {
        tabIndex: 0,
        attributes: {
          'data-kv-output': i,
        },
      }, [
        div('.output-thumbnail', [
          renderTable({
            layout: layout,
            diagram: state.diagram,
            kvMode: state.currentKvMode,
            editMode: state.currentEditMode,
            output: i,
            currentCube: state.currentCube,
            currentLoop: state.currentLoop,
            compact: true,
          }),
        ]),
        span('.output-label', output.name),
        button('.output-button-delete', {
          attributes: {
            'data-kv-remove-output': i,
          },
          disabled: !(canEdit && canRemove),
        }, 'Delete Button'),
      ])
    ).toArray()),
    button('.output-button-add', {
      attributes: {'data-kv-add-output': true},
      disabled: !(canEdit && canAdd),
    }, 'Add Output'),
  ])
;

const renderBody = (layout, state) =>
  renderTable({
    layout,
    diagram: state.diagram,
    kvMode: state.currentKvMode,
    editMode: state.currentEditMode,
    output: state.currentOutput,
    currentCube: state.currentCube,
    currentLoop: state.currentLoop,
    compact: false,
  })
;

const renderTableContainer = (layout, state) =>
  div('.diagram-scroller', [
    div('.diagram-scroller-body', [
      renderBody(layout, state),
    ]),
  ])
;

const render = ({state, layout}) =>
  div('.app', [
    div('.app-head', [
      div('.action-panel', [
        div('.action-list', [
          div('.action-list-item', [
            button('.action-button-open', {
              attributes: {'data-action': 'open'},
              title: 'Open Diagram...',
            }, 'Open...'),
          ]),
          div('.action-list-item', [
            button('.action-button-export', {
              attributes: {'data-action': 'save'},
              title: 'Export Diagram...',
            }, 'Export...'),
          ]),
          div('.action-list-item', [
            button('.action-button-settings', {
              attributes: {'data-action': 'settings'},
              title: 'Settings...',
            }, 'Settings'),
          ]),
          div('.action-list-item', [
            button('.action-button-help', {
              attributes: {'data-action': 'help'},
              title: 'Help...',
            }, 'Help'),
          ]),
        ]),
      ]),
      div('.edit-panel', [
        renderInputSpinner(state),
        div('.edit-mode-panel', [
          button('.edit-mode-button-function' +
            (state.currentEditMode === 'function' ? '.state-hidden' : '')
            , {
              attributes: {'data-edit-mode': 'function'},
            },'« Funktion bearbeiten'),
          button('.edit-mode-button-loops' +
            (state.currentEditMode === 'loops' ? '.state-hidden' : '')
            , {
              attributes: {'data-edit-mode': 'loops'},
            },'Loops bearbeiten »'),
        ]),
      ]),
,
      renderOutputThumbnails(layout, state, {
        canEdit: state.currentEditMode === 'function',
        canAdd: state.diagram.outputs.size < 7,
        canRemove: state.diagram.outputs.size > 1,
      }),
    ]),
    div('.app-body', [
      renderLoopList(state, state.currentEditMode === 'loops'),
      renderTableContainer(layout, state),
    ]),
  ]);

export default (state$, {helpBox$, settings$, open$, save$}) =>
  O.just(div([
    helpBox$,
    settings$,
    open$,
    save$,
    state$.map(render),
  ]))
;
