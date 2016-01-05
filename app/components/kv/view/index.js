import {Observable as O} from 'rx';

import {
  div, button ,span, ul, li,
} from '@cycle/dom';

import {
  renderTable,
} from './table';

import './index.styl';

const renderInputSpinner = (state) =>
  div('.input-spinner', [
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

const renderLoopButton = (state, loop, index) =>
  li([
    button('.well', {
      style: {
        backgroundColor: loop.color,
      },
      attributes: {
        'data-loop-index': index,
      },
    }, "X"),
    button('.well-delete', 'Delete'),
  ])
;

const renderModeButton = (state) => {
  const mode = state.currentMode.name;
  return button('.toggle-button', {attributes: {
    'data-kv-mode': (mode === 'dnf' ? 'knf' : 'dnf'),
  }},[
    span('.toggle-button-state', {
      className: (mode === 'dnf' ? 'state-active' : null),
    }, 'DNF'),
    span('.toggle-button-state', {
      className: (mode === 'knf' ? 'state-active' : null),
    }, 'KNF'),
  ]);
};

const renderLoopList = (state) =>
  div('.loop-list', [
    renderModeButton(state),
    span('.toolbar-title', 'Loops:'),
    ul('.inline-list', [
      state.diagram.loops
      .map((loop, index) => ({loop, index}))
      .filter(({loop}) => loop.mode === state.currentMode)
      .map(({loop, index}) =>
        renderLoopButton(state, loop, index)
      ).toArray(),
      //li(button('.well.well-add', 'Add Loop')),
    ]),
  ])
;

const renderOutputThumbnails = (layout, state, canAdd, canRemove) =>
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
            mode: state.currentMode,
            output: i,
            currentCube: state.currentCube,
            currentLoop: state.currentLoop,
            compact: true,
          }),
        ]),
        span('.output-label', 'Out 1'),
        canRemove ? button('.output-button-delete', {
          attributes: {
            'data-kv-remove-output': i,
          },
        }, 'Delete Button') : null,
      ])
    ).toArray()),
    canAdd ? button('.output-button-add', {
      attributes: {'data-kv-add-output': true},
    }, 'Add Output') : null,
  ])
;

const renderBody = (layout, state) =>
  renderTable({
    layout,
    diagram: state.diagram,
    mode: state.currentMode,
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
            button('.action-button-open', 'Open'),
          ]),
          div('.action-list-item', [
            button('.action-button-settings', 'Settings'),
          ]),
          div('.action-list-item', [
            button('.action-button-help', {
              attributes: {'data-action': 'help'},
            }, 'Help'),
          ]),
        ]),
      ]),
      div('.edit-panel', [
        renderInputSpinner(state),
        div('.edit-mode-panel', [
          button('.edit-mode-button-function.state-hidden',
            'Funktion bearbeiten'),
          button('.edit-mode-button-loops',
            'Loops bearbeiten »'),
        ]),
      ]),
,
      //renderLoopList(state),
      renderOutputThumbnails(layout, state,
        state.diagram.outputs.size < 7,
        state.diagram.outputs.size > 1
      ),
    ]),
    div('.app-body', [
      renderTableContainer(layout, state),
    ]),
  ]);

export default (state$, {helpBox$}) =>
  O.just(div([
    helpBox$,
    state$.map(render),
  ]))
;
