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
  const mousedown$ = DOM
    .select('.kv-cell-atom[data-kv-offset]')
    .events('mousedown')
    .do(preventDefault)
    .filter((evt) => evt.shiftKey)
    .map((evt) => ({
      offset: parseInt(evt.target.dataset.kvOffset, 10),
      output: parseInt(evt.target.dataset.kvOutput, 10),
    }))
    .filter(({offset}) => !isNaN(offset));
  const drag$ = mousedown$
    .flatMap(({offset, output}) =>
      O.just({
        output: output,
        startOffset: offset,
        targetOffset: offset,
      }).concat(
        mouseEnter$
        .distinctUntilChanged()
        .map((targetOffset) => ({
          output,
          startOffset: offset,
          targetOffset,
        })
      )
      ).takeUntil(mouseUp$)
    );

  const dragEnd$ = drag$
    .sample(mouseUp$);

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
    help$:
      DOM
        .select('[data-help]')
        .events('click')
        .do(preventDefault)
        .map(pluckDataAttr('help'))
        .map((val) => val === 'true'),
  };
};
