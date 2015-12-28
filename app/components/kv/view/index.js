import {Observable as O} from 'rx';

import {
  div, button ,span, ul, li,
} from '@cycle/dom';

import {
  renderTable,
} from './table';

import './index.styl';

const renderToolbar = (state) =>
  div('#toolbar.toolbar', [
    button('.numberButton',
      {
        attributes: {'data-kv-counter': 'decrement'},
        disabled: state.diagram.inputs.size <= 0,
      },
      '-'),
    span('.input-count',
      {attributes: {'data-label': 'Inputs'}},
      state.diagram.inputs.size),
    button('.numberButton',
      {
        attributes: {'data-kv-counter': 'increment'},
        disabled: state.diagram.inputs.size >= 8,
      },
      '+'),
  ])
;

const renderLoopButton = (state, loop, index) =>
  li([
    button('.well', {
      style: {'background-color': loop.color},
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

const renderOutputList = (state) =>
  div('.output-list', [
    span('.toolbar-title', 'Outputs:'),
    ul('.inline-list', [
      state.diagram.outputs.map((output, i, all) =>
        li(
          span('.pill' +
            (i === state.currentOutput ? '.state-active' : ''), {
              attributes: {
                'data-kv-output': i,
              },
            }, [
              output.name,
              all.size > 1 && button('.pill-delete', {attributes: {
                'data-kv-remove-output': i,
              }}, 'X') || null,
            ]
          )
        )
      ).toArray(),
      state.diagram.outputs.size < 7 && li(
        button('.pill', {attributes: {'data-kv-add-output': true}},'+')
      ) || null,
      //li(button('.well.well-add', 'Add Loop')),
    ]),
  ])
;

const renderOutputThumbnails = (layout, state) =>
  div('.output-thumbnails', [
    ul('.inline-list', [
      state.diagram.outputs.map((output, i) =>
        li('.output-thumbnails-item',
          renderTable({
            layout: layout,
            diagram: state.diagram,
            mode: state.currentMode,
            output: i,
            currentCube: state.currentCube,
            compact: true,
          })
        )
      ).toArray(),
    ]),
  ])
;

const renderBody = (layout, state) =>
  renderTable({
    layout,
    diagram: state.diagram,
    mode: state.currentMode,
    output: state.currentOutput,
    currentCube: state.currentCube,
    compact: false,
  })
;

const renderTableContainer = (layout, state) =>
  div('.scroller', [
    div('.scoller-inner', [
      renderBody(layout, state),
    ]),
  ])
;

const render = ({state, layout}) =>
  div([
    renderToolbar(state),
    renderLoopList(state),
    renderOutputList(state),
    renderOutputThumbnails(layout, state),
    renderTableContainer(layout, state),
  ]);

export default (state$, {helpBox$}) =>
  O.just(div([
    helpBox$,
    state$.map(render),
  ]))
;
