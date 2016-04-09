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

const findAttribute = (attr, element) =>
  element &&
  element.getAttribute &&
  element.getAttribute(attr) ||
  (element.parentNode && findAttribute(attr, element.parentNode))
;

export default (DOM, stageDOM, globalEvents, resetSelection$) => {
  const cancel$ = globalEvents.events('keydown')
    .filter((evt) => evt.keyCode === 27)
    .share();

  const autoLayoutButton = DOM.select('[data-action="autolayout"]');
  const removeNodeButton = DOM.select('[data-remove-node]');
  const removeEdgeButton = DOM.select('[data-remove-edge]');

  const moveableNode = stageDOM
    .select('[data-node-index][data-action="move"]');
  const connectableNode = stageDOM
    .select('[data-node-index][data-action="connect"]');
  const selectableNode = stageDOM
    .select('[data-node-index][data-action="select"]');
  const selectableEdge = stageDOM
    .select('[data-edge][data-action="select"]');

  const creationTarget = stageDOM.select('[data-background="create"]');
  const background = stageDOM.select('[data-background]');

  const modeButton = DOM.select('[data-mode]');

  const switchMode$ = modeButton.events('click');

  const selectNode$ = selectableNode.events('mousedown', {useCapture: true});
  const selectEdge$ = selectableEdge.events('mousedown', {useCapture: true});

  const createStart$ = O.amb(
    creationTarget.events('mousedown', {useCapture: true})
      .filter((evt) => evt.which === 1),
    creationTarget.events('touchstart', {useCapture: true})
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
    const nodeIndex = parseInt(
      startEvt.ownerTarget.getAttribute('data-node-index'), 10
    );

    const startPosition = svgEventPosition({
      x: startEvt.pageX,
      y: startEvt.pageY,
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
      x: evt.pageX,
      y: evt.pageY,
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
      x: evt.pageX,
      y: evt.pageY,
    },
    startEvt.ownerTarget.ownerSVGElement))
    .map(({x,y}) => ({x,y}))
    .takeUntil(dragEnd$)
    .takeUntil(cancel$);
  }).mergeAll();

  const tryConnectNodes$ = connectStart$.map((startEvt) => {
    const fromIndex = parseInt(
      startEvt.ownerTarget.getAttribute('data-node-index'), 10
    );

    const touchId = startEvt.touches ?
      startEvt.touches[0].identifier : null;

    return dragMove$
    .startWith(startEvt)
    .map((evt) => {
      const touch = touchId ? Array.prototype.filter.call(
        evt.touches, (t) => t.identifier === touchId
      )[0] : null;

      const x = touch ? touch.clientX : evt.pageX;
      const y = touch ? touch.clientY : evt.pageY;

      const pos = svgEventPosition({x,y},
        startEvt.ownerTarget.ownerSVGElement
      );

      const target = document.elementFromPoint(x, y);
      const toIndexAttr = findAttribute('data-node-index', target);
      const toIndex = toIndexAttr ? parseInt(toIndexAttr, 10) : null;

      return {
        x: pos.x,
        y: pos.y,
        toIndex,
      };
    })
    .map(({x,y,toIndex}) => ({
      fromIndex,
      toIndex,
      x,
      y,
    }))
    .takeUntil(dragEnd$)
    .takeUntil(cancel$);
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

  const confirmConnectNodes$ = tryConnectNodes$.sample(
    O.merge([
      connectStart$.map(() => dragEnd$),
      cancel$.map(() => O.empty()),
    ]).switch()
  );

  const removeNode$ = removeNodeButton.events('click')
    .map((evt) => parseInt(
      evt.ownerTarget.dataset.removeNode, 10
    ))
    .share();

  const removeEdge$ = removeEdgeButton.events('click')
    .map((evt) => {
      const [fromIndex, toIndex] =
        evt.ownerTarget.dataset.removeEdge.split('-');

      return {
        fromIndex: parseInt(fromIndex, 10),
        toIndex: parseInt(toIndex, 10),
      };
    })
    .share();

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

    tryConnectNodes$,
    stopConnectNodes$: O.merge([
      confirmConnectNodes$,
      cancel$,
    ]).share(),
    doConnectNodes$: confirmConnectNodes$,

    selectNode$: selectNode$.map((e) => parseInt(
      e.ownerTarget.getAttribute('data-node-index'), 10
    )),
    selectEdge$: selectEdge$.map((e) => {
      const edgeId = e.ownerTarget.getAttribute('data-edge').split(',');

      return {
        fromIndex: parseInt(edgeId[0], 10),
        toIndex: parseInt(edgeId[1], 10),
      };
    }),

    removeNode$,
    removeEdge$,

    deselect$: O.merge([
      cancel$,
      emptyClick$,
      resetSelection$,
    ]).share(),

    switchMode$: switchMode$.map(
      (evt) => evt.ownerTarget.dataset.mode
    ).share(),

    autoLayout$: autoLayoutButton
      .events('click')
      .map(() => true)
      .share(),

    preventDefault: O.merge([
      modeButton.events('mousedown'),
      autoLayoutButton.events('mousedown'),
      moveStart$,
      createStart$,
      switchMode$,
      selectNode$,
      selectEdge$,
      connectStart$,
      removeNodeButton.events('mousedown'),
      removeEdgeButton.events('mousedown'),
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
