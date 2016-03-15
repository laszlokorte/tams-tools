import {Observable as O} from 'rx';

const svgEventPosition = (() => {
  let oldPoint = null;
  return ({x,y}, svg) => {
    const pt = oldPoint || (oldPoint = svg.createSVGPoint());
    pt.x = x;
    pt.y = y;
    const result = pt.matrixTransform(svg.getScreenCTM().inverse());
    return result;
  };
})();

export default (DOM, globalEvents) => {
  const cancel$ = globalEvents.events('keydown')
    .filter((evt) => evt.keyCode === 27)
    .share();

  const node = DOM.select('[data-node-index]');
  const target = DOM.select('[data-target]');

  const createStart$ = O.amb(
    target.events('mousedown', {useCapture: true}),
    target.events('touchstart', {useCapture: true})
  );

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

  const drag$ = dragStart$.map((e) => {
    return dragMove$.takeUntil(dragEnd$).startWith(e);
  }).mergeAll();

  const tryCreate$ = createStart$.map((startEvt) => {
    return dragMove$
    .startWith(startEvt)
    .map((evt) => svgEventPosition({
      x: evt.clientX,
      y: evt.clientY,
    },
    startEvt.ownerTarget.ownerSVGElement))
    .map(({x,y}) => ({x,y}))
    .takeUntil(dragEnd$).takeUntil(cancel$);
  }).mergeAll();

  const createConfirm$ = tryCreate$.sample(
    O.merge([
      createStart$.map(() => dragEnd$),
      cancel$.map(() => O.empty()),
    ]).switch()
  );

  return {
    tryCreate$,
    stopCreate$: O.merge([
      createConfirm$,
      cancel$,
    ]).share(),
    doCreate$: createConfirm$,
    drag$,
    preventDefault: O.merge([
      dragStart$,
      createStart$,
    ]).share(),
    stopPropagation: O.merge([
      dragStart$,
      createStart$,
    ]).share(),
  };
};
