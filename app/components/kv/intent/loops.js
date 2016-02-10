import {Observable as O} from 'rx';
import BitSet from 'bitset.js';

const touchTarget = (evt) =>
  document.elementFromPoint(
    evt.changedTouches[0].clientX,
    evt.changedTouches[0].clientY
  )
;

export default ({DOM, globalEvents, cancel$}) => {
  const removeLoopButton = DOM
    .select('[data-loop-index]');

  const removeLoopEvent$ = removeLoopButton
    .events('click');

  const touchEnd$ = globalEvents.events('touchend');
  const mouseUp$ = globalEvents.events('mouseup');

  const mouseEnterEvent$ = DOM
    .select('.kv-cell-atom[data-edit="loops"][data-kv-cell]')
    .events('mouseenter', true);

  const touchMoveEvent$ = DOM
    .select('.kv-cell-atom[data-edit="loops"][data-kv-cell]')
    .events('touchmove');

  const pointerEnter$ = O.merge([
    mouseEnterEvent$
      .map((evt) => ({
        cell: BitSet(evt.ownerTarget.dataset.kvCell),
      }))
    ,
    touchMoveEvent$
      .map((evt) => {
        const element = touchTarget(evt);
        return {
          cell: element && element.dataset.hasOwnProperty('kvCell') ?
            BitSet(element.dataset.kvCell) : null,
        };
      }),
  ]).share();

  const pointerDownEvent$ = O.merge([
    DOM
      .select('.kv-cell-atom[data-edit="loops"][data-kv-cell]')
      .events('touchstart'),
    DOM
      .select('.kv-cell-atom[data-edit="loops"][data-kv-cell]')
      .events('mousedown'),
  ]).share();

  const pointerDown$ = pointerDownEvent$
    .map((evt) => ({
      allOutputs: !evt.altKey,
      cell: BitSet(evt.ownerTarget.dataset.kvCell),
      output: parseInt(evt.ownerTarget.dataset.kvOutput, 10),
    }))
    .filter(({cell}) => cell !== null)
    ;

  const pointerUp$ = O.merge([
    touchEnd$,
    mouseUp$,
  ]);

  const drag$ = pointerDown$
    .map(({cell, output, allOutputs}) =>
      O.just({
        allOutputs,
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
          allOutputs,
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
    .switch()
    .share();

  const dragEnd$ = drag$
    .sample(
      O.merge([
        pointerDown$.map(() => pointerUp$),
        cancel$.map(() => O.empty()),
      ]).switch()
    ).share();

  return {
    removeLoop$:
      removeLoopEvent$
        .map((evt) => ({
          loopIndex: parseInt(evt.ownerTarget.dataset.loopIndex, 10),
          allOutputs: !evt.altKey,
        }))
        .share(),
    tryLoop$:
      drag$,
    stopTryLoop$:
      O.merge([
        dragEnd$,
        cancel$,
      ])
        .map(() => true)
        .share(),
    addLoop$:
      dragEnd$,

    preventDefault: O.merge([
      removeLoopEvent$,
      removeLoopButton.events('mousedown'),
      mouseEnterEvent$,
      touchMoveEvent$,
      pointerDownEvent$,
    ]).share(),
  };
};
