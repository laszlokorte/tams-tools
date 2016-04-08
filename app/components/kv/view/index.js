import {Observable as O} from 'rx';
import FocusHook from 'virtual-dom/virtual-hyperscript/hooks/focus-hook';

import cache from '../../../lib/cache';

import settingsIcon from '../../../icons/settings';
import openIcon from '../../../icons/open';
import exportIcon from '../../../icons/export';
import helpIcon from '../../../icons/help';
import plusIcon from '../../../icons/plus';
import deleteIcon from '../../../icons/delete';

import {
  div, button ,span, ul, li,
} from '@cycle/dom';

import {
  renderTable,
} from './table';

import renderSpinner from './spinner';

import './index.styl';

const renderLoopIcon = (loop, index, editable) =>
  li('.loop-list-item', [
    span('.loop-icon', {
      style: {
        backgroundColor: loop.color,
      },
    }, [
      button('.loop-button-delete', {
        attributes: editable ? {
          'data-loop-index': index,
        } : {},
        disabled: !editable,
      }, deleteIcon(24)),
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
      [li('.loop-list-item-empty', 'No loops have been created yet')] :
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
    ul('.output-list', [
      state.diagram.outputs.map((output, i) =>
      li('.output-list-item' +
      (i === state.currentOutput ? '.state-current' : ''), {
        key: i,
        tabIndex: 0,
        attributes: {
          'data-kv-output': i,
        },
      }, [
        div('.output-thumbnail', [
          div([
            renderTable({
              layout: layout,
              diagram: state.diagram,
              kvMode: state.currentKvMode,
              editMode: state.currentEditMode,
              output: i,
              currentLoop: state.currentLoop,
              compact: true,
            }),
          ]),
        ]),
        span('.output-label' + (
          canEdit ? '.state-editable' : ''
        ),{
          attributes: {
            'data-kv-output-label': i,
          },
        }, state.renameOutput === i ? [
          span('.output-label-edit' + (
            state.renameOutputValid ? '' : '.state-invalid'
          ), {
            focus: new FocusHook(),
            attributes: {
              tabindex: 0,
              contenteditable: true,
              maxlength: 7,
              'data-kv-output-edit-label': i,
            },
          }, output.name),
        ] : output.name),
        button('.output-button-delete', {
          attributes: {
            'data-kv-remove-output': i,
          },
          disabled: !(canEdit && canRemove),
        }, deleteIcon(24)),
      ])
    ).toArray(),
      li('.output-list-item', [
        button('.output-button-add', {
          attributes: {'data-kv-add-output': true},
          disabled: !(canEdit && canAdd),
        }, plusIcon(24)),
      ]),
    ]),
  ])
;

const renderBody = (layout, state) =>
  renderTable({
    layout,
    diagram: state.diagram,
    kvMode: state.currentKvMode,
    editMode: state.currentEditMode,
    output: state.currentOutput,
    currentLoop: state.currentLoop,
    compact: false,
    cellStyle: state.viewSetting,
  })
;

const renderTableContainer = (layout, state) =>
  div('.diagram-scroller', [
    div('.diagram-scroller-body', [
      renderBody(layout, state),
    ]),
  ])
;

const render = ({state, layout}, index) =>
  div('.app', [
    state.errorMessage ? div('.error-message', {
      key: `error-${index}`,
    }, [
      state.errorMessage.toString(),
    ]) : null,
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
      div('.edit-panel', [
        div('.edit-mode-panel', [
          button('.edit-mode-button' +
            (state.currentEditMode === 'function' ? '.state-active' : '')
            , {
              attributes: {'data-edit-mode': 'function'},
            },'Edit function'),
          button('.edit-mode-button' +
            (state.currentEditMode === 'loops' ? '.state-active' : '')
            , {
              attributes: {'data-edit-mode': 'loops'},
            },'Edit loops'),
        ]),
        renderSpinner({
          attributes: {
            'data-spinner': 'inputs',
          },
          label: 'Inputs',
          readonly: state.currentEditMode !== 'function',
          value: state.diagram.inputs.size,
          min: 0,
          max: state.maxInputs,
        }),
        renderSpinner({
          attributes: {
            'data-spinner': 'outputs',
          },
          label: 'Outputs',
          readonly: state.currentEditMode !== 'function',
          value: state.diagram.outputs.size,
          min: 1,
          max: state.maxOutputs,
        }),
      ]),

      renderOutputThumbnails(layout, state, {
        canEdit: state.currentEditMode === 'function',
        canAdd: state.diagram.outputs.size < state.maxOutputs,
        canRemove: state.diagram.outputs.size > 1,
      }),
    ]),
    div('.app-body', [
      renderLoopList(state, state.currentEditMode === 'loops'),
      renderTableContainer(layout, state),
    ]),
  ]);

export default (state$, panels$) =>
  O.combineLatest(state$, panels$,
    (state, panels) =>
      div([
        panels,
        cache(() => render(state), state, "KV"),
      ])
  )
;
