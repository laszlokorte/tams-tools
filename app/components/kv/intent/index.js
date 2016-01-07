import {Observable as O} from 'rx';
import BitSet from 'bitset.js';

import {parseDataAttr} from '../../../lib/utils';

import panelActions from './panels';

const touchTarget = (evt) =>
  document.elementFromPoint(
    evt.changedTouches[0].clientX,
    evt.changedTouches[0].clientY
  )
;
export default (DOM, keydown, openData$) => {
  const cancel$ = keydown
    .filter((evt) => evt.keyCode === 27)
  ;

  const touchEnd$ = O.fromEvent(document, 'touchend');
  const mouseUp$ = O.fromEvent(document, 'mouseup');

  const mouseEnterEvent$ = DOM
    .select('.kv-cell-atom[data-edit="loops"][data-kv-cell]')
    .events('mouseenter', true);

  const touchMoveEvent$ = DOM
    .select('.kv-cell-atom[data-edit="loops"][data-kv-cell]')
    .events('touchmove');

  const pointerEnter$ = O.merge(
    mouseEnterEvent$
      .map((evt) => ({
        cell: BitSet(evt.currentTarget.dataset.kvCell),
      }))
    ,
    touchMoveEvent$
      .map((evt) => {
        const element = touchTarget(evt);
        return {
          cell: element && element.dataset.hasOwnProperty('kvCell') ?
            BitSet(element.dataset.kvCell) : null,
        };
      })
  );

  const pointerDownEvent$ = O.merge(
      DOM
        .select('.kv-cell-atom[data-edit="loops"][data-kv-cell]')
        .events('touchstart'),
      DOM
        .select('.kv-cell-atom[data-edit="loops"][data-kv-cell]')
        .events('mousedown')
    );

  const pointerDown$ = pointerDownEvent$
    .map((evt) => ({
      cell: BitSet(evt.currentTarget.dataset.kvCell),
      output: parseInt(evt.currentTarget.dataset.kvOutput, 10),
    }))
    .filter(({cell}) => cell !== null)
    ;

  const pointerUp$ = O.merge(
    touchEnd$,
    mouseUp$
  );

  const drag$ = pointerDown$
    .map(({cell, output}) =>
      O.just({
        output: output,
        startCell: cell,
        targetCell: cell,
      }).concat(
        pointerEnter$
        .filter(({cell: c}) => c !== null)
        .distinctUntilChanged(
          ({cell: c}) => c,
          (a, b) => a.equals(b)
        )
        .map(({cell: targetCell}) => ({
          output,
          startCell: cell,
          targetCell,
        })
      )
      ).takeUntil(
        cancel$
      ).takeUntil(
        pointerUp$
      )
    )
    .switch();

  const dragEnd$ = drag$
    .sample(
      O.merge(
        pointerDown$.map(() => pointerUp$),
        cancel$.map(() => O.empty())
      ).switch()
    );

  const panels = panelActions({DOM});

  const removeLoopButton = DOM
    .select('[data-loop-index]');

  const removeLoopEvent$ = removeLoopButton
    .events('click');

  const addOutputButton = DOM
    .select('[data-kv-add-output]');

  const addOutputEvent$ = addOutputButton
    .events('click');

  const removeOutputEvent$ = DOM
    .select('[data-kv-remove-output]')
    .events('click');

  const outputItem = DOM
    .select('[data-kv-output]');

  const outputLabel = DOM
    .select('.state-editable[data-kv-output-label]');

  const outputEditLabel = DOM
    .select('[data-kv-output-edit-label]');

  const selectOutputEvent$ = outputItem
    .events('click')
    .filter((e) => e.target.tagName !== 'INPUT');

  const editModeButton = DOM
    .select('[data-edit-mode]');

  const kvModeButton = DOM
    .select('[data-kv-mode]');

  const switchKvModeEvent$ = kvModeButton
    .events('click');

  const switchEditModeEvent$ = editModeButton
    .events('click');

  const incrementButton = DOM
    .select('[data-kv-counter="increment"]');

  const decrementButton = DOM
    .select('[data-kv-counter="decrement"]');

  const incrementEvent$ = incrementButton
    .events('click');

  const decrementEvent$ = decrementButton
    .events('click');

  const startRenameEvent$ = outputLabel
    .events('click')
    .filter((evt) => evt.target.tagName !== 'INPUT');

  const cancelRenameEvent$ = O.merge(
    outputEditLabel
        .events('keydown')
        .filter((e) => e.keyCode === 27),
    outputEditLabel
        .events('focusout')
  );

  const tryOutputNameEvent$ = outputEditLabel
    .events('input');

  const confirmOutputNameEvent$ = outputEditLabel
    .events('keydown')
    .filter((e) => e.keyCode === 13);

  return {
    addInput$:
      incrementEvent$
        .map(() => true)
        .share(),
    removeInput$:
      decrementEvent$
        .map(() => true)
        .share(),
    cycleValue$:
      DOM
        .select('.kv-cell-atom[data-edit="function"][data-kv-cell]')
        .events('click')
        .map((evt) => ({
          reverse: evt.altKey,
          output: parseInt(evt.currentTarget.dataset.kvOutput, 10),
          cell: BitSet(evt.currentTarget.dataset.kvCell),
        }))
        .share(),
    removeLoop$:
      removeLoopEvent$
        .map(parseDataAttr('loopIndex'))
        .filter(isFinite)
        .share(),
    tryLoop$:
      drag$
        .share(),
    stopTryLoop$:
      O.merge(dragEnd$, cancel$)
        .map(() => true)
        .share(),
    addLoop$:
      dragEnd$.share(),
    addOutput$:
      addOutputEvent$
        .map(() => true)
        .share(),
    removeOutput$:
      removeOutputEvent$
        .map(parseDataAttr('kvRemoveOutput'))
        .filter(isFinite)
        .share(),
    selectOutput$:
      selectOutputEvent$
        .map(parseDataAttr('kvOutput'))
        .filter(isFinite)
        .share(),
    switchKvMode$:
      switchKvModeEvent$
        .map((evt) => evt.currentTarget.dataset.kvMode)
        .share(),
    switchEditMode$:
      switchEditModeEvent$
        .map((evt) => evt.currentTarget.dataset.editMode)
        .share(),
    panel$: panels.open$,

    startRename$:
      startRenameEvent$
        .map((evt) => parseInt(evt.currentTarget.dataset.kvOutputLabel, 10))
        .share(),

    cancelRename$:
      cancelRenameEvent$
        .map(() => true)
        .share(),

    tryOutputName$:
      tryOutputNameEvent$
        .map((evt) => ({
          outputIndex: parseInt(
            evt.currentTarget.dataset.kvOutputEditLabel,
            10),
          name: evt.currentTarget.value,
        }))
        .share(),

    confirmOutputName$:
      confirmOutputNameEvent$
        .map(() => true)
        .share(),

    openDiagram$: openData$,

    preventDefault: O.merge(
      panels.preventDefault,
      mouseEnterEvent$,
      touchMoveEvent$,
      pointerDownEvent$,
      removeLoopEvent$,
      removeLoopButton.events('mousedown'),
      addOutputEvent$,
      addOutputButton.events('mousedown'),
      removeOutputEvent$,
      selectOutputEvent$,
      outputItem.events('mousedown')
        .filter((e) => e.target.tagName !== 'INPUT'),
      switchKvModeEvent$,
      kvModeButton.events('mousedown'),
      switchEditModeEvent$,
      editModeButton.events('mousedown'),
      incrementEvent$,
      decrementEvent$,
      incrementButton.events('mousedown'),
      decrementButton.events('mousedown'),
      startRenameEvent$,
      cancelRenameEvent$,
      tryOutputNameEvent$,
      confirmOutputNameEvent$
    ).share(),
  };
};
