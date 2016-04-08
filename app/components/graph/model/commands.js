import {Observable as O} from 'rx';

export default (actions, state$) =>
  O.merge([
    // actions.tryCreateNode$.flatMap(() =>
    //   actions.doCreateNode$.takeUntil(stopCreateNode$)
    // )

    actions.tryCreateNode$
      .sample(actions.doCreateNode$)
      .map(({x,y}) => ({
        action: 'createNode',
        x,
        y,
      }))
      .share(),

    actions.tryMoveNode$
      .sample(actions.doMoveNode$)
      .map(({nodeIndex, x,y}) => ({
        action: 'moveNode',
        index: nodeIndex,
        x,
        y,
      }))
      .share(),

    state$.sample(actions.autoLayout$).flatMap((state) => {
      return O.fromArray(state.graph.nodes.toArray())
        .map((node, nodeIndex) => ({
          action: 'moveNode',
          index: nodeIndex,
          x: node.x,
          y: node.y,
        }));
    }),

    actions.tryConnectNodes$
      .sample(actions.doConnectNodes$)
      .filter(({toIndex}) => toIndex !== null)
      .map(({fromIndex, toIndex}) => ({
        action: 'connectNodes',
        fromIndex,
        toIndex,
      }))
      .share(),

    actions.removeNode$.map((nodeIndex) => ({
      action: 'removeNode',
      index: nodeIndex,
    })).share(),

    actions.removeEdge$.map(({fromIndex, toIndex}) => ({
      action: 'removeEdge',
      fromIndex,
      toIndex,
    })).share(),
  ])
;
