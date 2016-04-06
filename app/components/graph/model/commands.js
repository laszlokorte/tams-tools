import {Observable as O} from 'rx';

export default (actions) =>
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

    actions.tryConnectNodes$
      .sample(actions.doConnectNodes$)
      .filter(({toIndex}) => toIndex !== null)
      .map(({fromIndex, toIndex}) => ({
        action: 'connectNodes',
        fromIndex,
        toIndex,
      }))
      .share(),

  ])
;
