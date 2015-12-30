import {Observable as O} from 'rx';
import BitSet from '../../lib/monkeypatches/bitset.js';

import {preventDefault, parseDataAttr} from '../../lib/utils';

const touchTarget = (evt) =>
  document.elementFromPoint(
    evt.changedTouches[0].clientX,
    evt.changedTouches[0].clientY
  )
;
export default (DOM) => {
  const pointerUp$ = O.merge(
    O.fromEvent(document, 'touchend'),
    O.fromEvent(document, 'mouseup')
  );
  const pointerEnter$ = O.merge(
    DOM
      .select('.kv-cell-atom[data-kv-cell]')
      .events('mouseenter')
      .map((evt) => ({
        evt,
        cell: BitSet(evt.currentTarget.dataset.kvCell),
      }))
    ,
    DOM
      .select('.kv-cell-atom[data-kv-cell]')
      .events('touchmove')
      .map((evt) => {
        const element = touchTarget(evt);
        return {
          evt,
          cell: element && element.dataset.hasOwnProperty('kvCell') ?
            BitSet(element.dataset.kvCell) : null,
        };
      })
  );
  const pointerDown$ = O.merge(
      DOM
        .select('.kv-cell-atom[data-kv-cell]')
        .events('touchstart'),
      DOM
        .select('.kv-cell-atom[data-kv-cell]')
        .events('mousedown')
        .filter((evt) => !!evt.shiftKey)
    )
    .map((evt) => ({
      evt,
      cell: BitSet(evt.currentTarget.dataset.kvCell),
      output: parseInt(evt.currentTarget.dataset.kvOutput, 10),
    }))
    .do(({evt}) => evt.preventDefault())
    .filter(({cell}) => cell !== null)
    ;
  const drag$ = pointerDown$
    .flatMap(({cell, output}) =>
      O.just({
        output: output,
        startCell: cell,
        targetCell: cell,
      }).concat(
        pointerEnter$
        .filter(({cell: c}) => c !== null)
        .do(({evt}) => evt.preventDefault())
        .distinctUntilChanged(
          ({cell: c}) => c,
          (a, b) => a === b
        )
        .map(({cell: targetCell}) => ({
          output,
          startCell: cell,
          targetCell,
        })
      )
      ).takeUntil(
        pointerUp$
      )
    );

  const dragEnd$ = drag$
    .sample(pointerUp$);

  return {
    addInput$:
      DOM
        .select('[data-kv-counter="increment"]')
        .events('click')
        .map(() => true)
        .share(),
    removeInput$:
      DOM
        .select('[data-kv-counter="decrement"]')
        .events('click')
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
      DOM
        .select('[data-loop-index]')
        .events('click')
        .do(preventDefault)
        .map(parseDataAttr('loopIndex'))
        .filter(isFinite)
        .share(),
    tryLoop$:
      drag$
      .share(),
    stopTryLoop$:
      dragEnd$
      .map(() => true)
      .share(),
    addLoop$:
      dragEnd$.share(),
    addOutput$:
      DOM
        .select('[data-kv-add-output]')
        .events('click')
        .do(preventDefault)
        .map(() => true)
        .share(),
    removeOutput$:
      DOM
        .select('[data-kv-remove-output]')
        .events('click')
        .do(preventDefault)
        .do((e) => e.stopPropagation())
        .map(parseDataAttr('kvRemoveOutput'))
        .filter(isFinite)
        .share(),
    selectOutput$:
      DOM
        .select('[data-kv-output]')
        .events('click')
        .do(preventDefault)
        .do((e) => e.stopPropagation())
        .map(parseDataAttr('kvOutput'))
        .filter(isFinite)
        .share(),
    switchMode$:
      DOM
        .select('[data-kv-mode]')
        .events('click')
        .do(preventDefault)
        .map((evt) => evt.currentTarget.dataset.kvMode)
        .share(),
    help$:
      DOM
        .select('.help-button')
        .events('click')
        .do(preventDefault)
        .map(() => true)
        .share(),
  };
};
