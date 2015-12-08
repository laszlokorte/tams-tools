import {Observable as O} from 'rx';

export default (DOM) => {
  const mouseUp$ = O.fromEvent(document, 'mouseup')
    .do((evt) => evt.preventDefault());
  const mouseEnter$ = DOM.select('.kv-cell-atom[data-kv-offset]')
    .events('mouseenter')
    .do((evt) => evt.preventDefault())
    .map((evt) => parseInt(evt.target.dataset.kvOffset, 10))
    .filter((offset) => !isNaN(offset));
  const drag$ = DOM.select('.kv-cell-atom[data-kv-offset]')
    .events('mousedown')
    .do((evt) => evt.preventDefault())
    .filter((evt) => evt.shiftKey)
    .map((evt) => parseInt(evt.target.dataset.kvOffset, 10))
    .filter((offset) => !isNaN(offset))
    .flatMap((startOffset) =>
      O.just({
        startOffset: startOffset,
        targetOffset: startOffset,
      }).concat(
        mouseEnter$
        .map((targetOffset) => ({
          startOffset,
          targetOffset,
        })
      )
      ).takeUntil(mouseUp$)
    );

  return {
    addInput$:
      DOM.select('[data-kv-counter="increment"]')
        .events('click')
        .map(() => true),
    removeInput$:
      DOM.select('[data-kv-counter="decrement"]')
        .events('click')
        .map(() => true),
    cycleValue$:
      DOM.select('.kv-cell-atom[data-kv-offset]')
        .events('click')
        .filter((evt) => !evt.shiftKey)
        .map((evt) => ({
          reverse: evt.altKey,
          offset: parseInt(evt.target.dataset.kvOffset, 10),
        })),
    move$: drag$,
    moveEnd$: mouseUp$.withLatestFrom(drag$, (up, move) => move),
  };
};
