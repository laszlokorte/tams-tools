import {Observable as O} from 'rx';

import {preventDefault, parseDataAttr, pluckDataAttr} from '../../lib/utils';

export default (DOM) => {
  const mouseUp$ = O
    .fromEvent(document, 'mouseup')
    .do(preventDefault);
  const mouseEnter$ = DOM
    .select('.kv-cell-atom[data-kv-offset]')
    .events('mouseenter')
    .do(preventDefault)
    .map(parseDataAttr('kvOffset'))
    .filter(isFinite);
  const drag$ = DOM
    .select('.kv-cell-atom[data-kv-offset]')
    .events('mousedown')
    .do(preventDefault)
    .filter((evt) => evt.shiftKey)
    .map(parseDataAttr('kvOffset'))
    .filter(isFinite)
    .flatMap((startOffset) =>
      O.just({
        startOffset: startOffset,
        targetOffset: startOffset,
      }).concat(
        mouseEnter$
        .distinctUntilChanged()
        .map((targetOffset) => ({
          startOffset,
          targetOffset,
        })
      )
      ).takeUntil(mouseUp$)
    );

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
          offset: parseInt(evt.target.dataset.kvOffset, 10),
        })),
    removeLoop$:
      DOM
        .select('[data-loop-index]')
        .events('click')
        .do(preventDefault)
        .map(parseDataAttr('loopIndex'))
        .filter(isFinite),
    move$:
      drag$,
    moveEnd$:
      mouseUp$
        .withLatestFrom(drag$, (up, move) => move),
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
    help$:
      DOM
        .select('[data-help]')
        .events('click')
        .do(preventDefault)
        .map(pluckDataAttr('help'))
        .map((val) => val === 'true'),
  };
};
