import {Observable as O} from 'rx';

export default (DOM, globalEvents) => {
  const node = DOM.select('[data-node-index]');

  const dragStart$ = O.amb(
    node.events('mousedown', {useCapture: true}),
    node.events('touchstart', {useCapture: true})
  );

  const dragEnd$ = O.amb(
    globalEvents.events('mouseup'),
    globalEvents.events('touchend')
  );

  const dragMove$ = O.amb(
    globalEvents.events('mousemove'),
    globalEvents.events('touchmove')
  );

  const drag$ = dragStart$.map(() => {
    return dragMove$.takeUntil(dragEnd$);
  }).mergeAll();

  return {
    preventDefault: drag$,
    stopPropagation: O.merge(
      dragStart$
    ),
  };
};
