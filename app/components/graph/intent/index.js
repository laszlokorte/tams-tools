import {Observable as O} from 'rx';

export default (DOM) => {
  const node = DOM.select('[data-node-index]');

  const dragStart$ = O.amb(
    node.events('mousedown', {useCapture: true}),
    node.events('touchstart', {useCapture: true})
  );

  const dragEnd$ = O.amb(
    O.fromEvent(document, 'mouseup'),
    O.fromEvent(document, 'touchend')
  );

  const dragMove$ = O.fromEvent(document, 'mousemove');

  const drag$ = dragStart$.map((startEvt) => {
    return dragMove$.takeUntil(dragEnd$);
  }).mergeAll();

  drag$.subscribe((e) => console.log(e));

  return {
    preventDefault: O.empty(),
    stopPropagation: O.merge(
      dragStart$
    ),
  };
};
