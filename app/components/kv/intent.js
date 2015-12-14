import {Observable as O} from 'rx';

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
      .select('.kv-cell-atom[data-kv-offset]')
      .events('mouseenter')
      .map((evt) => ({
        evt,
        offset: parseInt(evt.target.dataset.kvOffset, 10),
      }))
    ,
    DOM
      .select('.kv-cell-atom[data-kv-offset]')
      .events('touchmove')
      .map((evt) => ({
        evt,
        offset: parseInt(touchTarget(evt).dataset.kvOffset, 10),
      }))
  );
  const pointerDown$ = O.merge(
      DOM
        .select('.kv-cell-atom[data-kv-offset]')
        .events('touchstart'),
      DOM
        .select('.kv-cell-atom[data-kv-offset]')
        .events('mousedown')
        .filter((evt) => !!evt.shiftKey)
    )
    .map((evt) => ({
      evt,
      offset: parseInt(evt.target.dataset.kvOffset, 10),
      output: parseInt(evt.target.dataset.kvOutput, 10),
    }))
    .do(({evt}) => evt.preventDefault())
    .filter(({offset}) => !isNaN(offset))
    ;
  const drag$ = pointerDown$
    .flatMap(({offset, output}) =>
      O.just({
        output: output,
        startOffset: offset,
        targetOffset: offset,
      }).concat(
        pointerEnter$
        .filter(({offset: o}) => !isNaN(o))
        .do(({evt}) => evt.preventDefault())
        .distinctUntilChanged(
          ({offset: o}) => o,
          (a, b) => a === b
        )
        .map(({offset: targetOffset}) => ({
          output,
          startOffset: offset,
          targetOffset,
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
        .select('.kv-cell-atom[data-kv-offset]')
        .events('click')
        .filter((evt) => !evt.shiftKey)
        .map((evt) => ({
          reverse: evt.altKey,
          output: parseInt(evt.target.dataset.kvOutput, 10),
          offset: parseInt(evt.target.dataset.kvOffset, 10),
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
