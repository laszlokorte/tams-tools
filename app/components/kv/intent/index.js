import {Observable as O} from 'rx';
import BitSet from 'bitset.js';

import {parseDataAttr} from '../../../lib/utils';

import {helpAction} from './help';

const touchTarget = (evt) =>
  document.elementFromPoint(
    evt.changedTouches[0].clientX,
    evt.changedTouches[0].clientY
  )
;
export default (DOM, keydown) => {
  const cancel$ = keydown
    .filter((evt) => evt.keyCode === 27)
  ;

  const touchEnd$ = O.fromEvent(document, 'touchend');
  const mouseUp$ = O.fromEvent(document, 'mouseup');

  const mouseEnterEvent$ = DOM
    .select('.kv-cell-atom[data-kv-cell]')
    .events('mouseenter', true);

  const touchMoveEvent$ = DOM
    .select('.kv-cell-atom[data-kv-cell]')
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
        .select('.kv-cell-atom[data-kv-cell]')
        .events('touchstart'),
      DOM
        .select('.kv-cell-atom[data-kv-cell]')
        .events('mousedown')
        .filter((evt) => !!evt.shiftKey)
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

  const help = helpAction({DOM});

  const removeLoopEvent$ = DOM
    .select('[data-loop-index]')
    .events('click');

  const addOutputEvent$ = DOM
    .select('[data-kv-add-output]')
    .events('click');

  const removeOutputEvent$ = DOM
    .select('[data-kv-remove-output]')
    .events('click');

  const selectOutputEvent$ = DOM
    .select('[data-kv-output]')
    .events('click');

  const switchModeEvent$ = DOM
    .select('[data-kv-mode]')
    .events('click');

  const incrementButton = DOM
    .select('[data-kv-counter="increment"]');

  const decrementButton = DOM
    .select('[data-kv-counter="decrement"]');

  const incrementEvent$ = incrementButton
    .events('click');

  const decrementEvent$ = decrementButton
    .events('click');

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
        .select('.kv-cell-atom[data-kv-cell]')
        .events('click')
        .filter((evt) => !evt.shiftKey)
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
    switchMode$:
      switchModeEvent$
        .map((evt) => evt.currentTarget.dataset.kvMode)
        .share(),
    help$: help.action$,

    preventDefault: O.merge(
      help.preventDefault,
      mouseEnterEvent$,
      touchMoveEvent$,
      pointerDownEvent$,
      removeLoopEvent$,
      addOutputEvent$,
      removeOutputEvent$,
      selectOutputEvent$,
      switchModeEvent$,
      incrementEvent$,
      decrementEvent$,
      incrementButton.events('mousedown'),
      decrementButton.events('mousedown')
    ).share(),
  };
};
