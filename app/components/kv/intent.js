import {Observable as O} from 'rx';
import BitSet from '../../lib/monkeypatches/bitset.js';

import {preventDefault, parseDataAttr, pluckDataAttr} from '../../lib/utils';

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
        cell: BitSet(evt.target.dataset.kvCell),
      }))
    ,
    DOM
      .select('.kv-cell-atom[data-kv-cell]')
      .events('touchmove')
      .map((evt) => {
        const element = touchTarget(evt);
        return {
          evt,
          cell: element ? BitSet(element.dataset.kvCell) : null,
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
      cell: BitSet(evt.target.dataset.kvCell),
      output: parseInt(evt.target.dataset.kvOutput, 10),
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
        .filter(({cell: o}) => !isNaN(o))
        .do(({evt}) => evt.preventDefault())
        .distinctUntilChanged(
          ({cell: o}) => o,
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
        .map(() => true),
    removeInput$:
      DOM
        .select('[data-kv-counter="decrement"]')
        .events('click')
        .map(() => true),
    cycleValue$:
      DOM
        .select('.kv-cell-atom[data-kv-cell]')
        .events('click')
        .filter((evt) => !evt.shiftKey)
        .map((evt) => ({
          reverse: evt.altKey,
          output: parseInt(evt.target.dataset.kvOutput, 10),
          cell: BitSet(evt.target.dataset.kvCell),
        })),
    removeLoop$:
      DOM
        .select('[data-loop-index]')
        .events('click')
        .do(preventDefault)
        .map(parseDataAttr('loopIndex'))
        .filter(isFinite),
    tryLoop$:
      drag$,
    addLoop$:
      dragEnd$,
    addOutput$:
      DOM
        .select('[data-kv-add-output]')
        .events('click')
        .do(preventDefault)
        .map(() => true),
    removeOutput$:
      DOM
        .select('[data-kv-remove-output]')
        .events('click')
        .do(preventDefault)
        .do((e) => e.stopPropagation())
        .map(parseDataAttr('kvRemoveOutput'))
        .filter(isFinite),
    selectOutput$:
      DOM
        .select('[data-kv-output]')
        .events('click')
        .do(preventDefault)
        .do((e) => e.stopPropagation())
        .map(parseDataAttr('kvOutput'))
        .filter(isFinite),
    switchMode$:
      DOM
        .select('[data-kv-mode]')
        .events('click')
        .do(preventDefault)
        .map((evt) => evt.target.dataset.kvMode),
    help$:
      DOM
        .select('[data-help]')
        .events('click')
        .do(preventDefault)
        .map(pluckDataAttr('help'))
        .map((val) => val === 'true'),
  };
};
