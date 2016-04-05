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

export default (DOM, stageDOM, globalEvents) => {
  const cancel$ = globalEvents.events('keydown')
    .filter((evt) => evt.keyCode === 27)
    .share();

  const moveableNode = stageDOM.select('[data-node-index][data-action="move"]');
  const connectableNode = stageDOM.select('[data-node-index][data-action="connect"]');
  const selectableNode = stageDOM.select('[data-node-index][data-action="select"]');
  const selectableEdge = stageDOM.select('[data-edge][data-action="select"]');

  const target = stageDOM.select('[data-target]');
  const background = stageDOM.select('[data-background]');

  const modeButton = DOM.select('[data-mode]');

  const switchMode$ = modeButton.events('click');

  const selectNode$ = selectableNode.events('mousedown', {useCapture: true});
  const selectEdge$ = selectableEdge.events('mousedown', {useCapture: true});

  const createStart$ = O.amb(
    target.events('mousedown', {useCapture: true})
      .filter((evt) => evt.which === 1),
    target.events('touchstart', {useCapture: true})
  );

  const moveStart$ = O.amb(
    moveableNode.events('mousedown', {useCapture: true})
      .filter((evt) => evt.which === 1),
    moveableNode.events('touchstart', {useCapture: true})
  );

  const connectStart$ = O.amb(
    connectableNode.events('mousedown', {useCapture: true})
      .filter((evt) => evt.which === 1),
    connectableNode.events('touchstart', {useCapture: true})
  );

  const dragEnd$ = O.amb(
    globalEvents.events('mouseup'),
    globalEvents.events('touchend')
  );

  const dragMove$ = O.amb(
    globalEvents.events('mousemove'),
    globalEvents.events('touchmove')
  );

  const tryMoveNode$ = moveStart$.map((startEvt) => {
    const nodeIndex = startEvt.ownerTarget.getAttribute('data-node-index');

    const startPosition = svgEventPosition({
      x: startEvt.clientX,
      y: startEvt.clientY,
    }, startEvt.ownerTarget.ownerSVGElement);

    const offsetX = parseInt(
      startEvt.ownerTarget.getAttribute('data-node-x') || '0', 10
    ) - startPosition.x;
    const offsetY = parseInt(
      startEvt.ownerTarget.getAttribute('data-node-y') || '0', 10
    ) - startPosition.y;

    return dragMove$
    .startWith(startEvt)
    .map((evt) => svgEventPosition({
      x: evt.clientX,
      y: evt.clientY,
    },
    startEvt.ownerTarget.ownerSVGElement)
    )
    .map(({x,y}) => ({
      nodeIndex,
      x: x + offsetX,
      y: y + offsetY,
    }))
    .takeUntil(dragEnd$)
    .takeUntil(cancel$);
  })
  .mergeAll()
  .share();

  const tryCreateNode$ = createStart$.map((startEvt) => {
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

  const confirmCreateNode$ = tryCreateNode$.sample(
    O.merge([
      createStart$.map(() => dragEnd$),
      cancel$.map(() => O.empty()),
    ]).switch()
  );

  const confirmMoveNode$ = tryMoveNode$.sample(
    O.merge([
      moveStart$.map(() => dragEnd$),
      cancel$.map(() => O.empty()),
    ]).switch()
  );

  const emptyClick$ = background
  .events('mousedown')
  .flatMap(() =>
    globalEvents.events('mouseup')
    .take(1)
    .takeUntil(
      globalEvents.events('mousemove')
    )
  )
  .share();

  return {
    tryCreateNode$,
    stopCreateNode$: O.merge([
      confirmCreateNode$,
      cancel$,
    ]).share(),
    doCreateNode$: confirmCreateNode$,

    tryMoveNode$,
    stopMoveNode$: O.merge([
      confirmMoveNode$,
      cancel$,
    ]).share(),
    doMoveNode$: confirmMoveNode$,

    selectNode$: selectNode$.map((e) => parseInt(
      e.ownerTarget.getAttribute('data-node-index'), 10
    )),
    selectEdge$: selectEdge$.map((e) => {
      const edgeId = e.ownerTarget.getAttribute('data-edge').split(',');

      return {
        from: parseInt(edgeId[0], 10),
        to: parseInt(edgeId[1], 10),
      };
    }),

    deselect$: O.merge([
      cancel$,
      emptyClick$,
    ]).share(),

    switchMode$: switchMode$.map(
      (evt) => evt.ownerTarget.dataset.mode
    ).share(),
    preventDefault: O.merge([
      moveStart$,
      createStart$,
      switchMode$,
      selectNode$,
      selectEdge$,
    ]).share(),
    stopPropagation: O.merge([
      moveStart$,
      createStart$,
      selectNode$,
      selectEdge$,
      connectStart$,
    ]).share(),
  };
};
