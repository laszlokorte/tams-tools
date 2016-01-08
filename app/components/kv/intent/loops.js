import {Observable as O} from 'rx';
import BitSet from 'bitset.js';

import {parseDataAttr} from '../../../lib/utils';

const touchTarget = (evt) =>
  document.elementFromPoint(
    evt.changedTouches[0].clientX,
    evt.changedTouches[0].clientY
  )
;

export default ({DOM, cancel$}) => {
  const removeLoopButton = DOM
    .select('[data-loop-index]');

  const removeLoopEvent$ = removeLoopButton
    .events('click');

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

  return {
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

    preventDefault: O.merge(
      removeLoopEvent$,
      removeLoopButton.events('mousedown'),
      mouseEnterEvent$,
      touchMoveEvent$,
      pointerDownEvent$
    ),
  };
};
