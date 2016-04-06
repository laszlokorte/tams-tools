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
      const count = state.graph.nodes.size;

      const centerX = state.graph.nodes.reduce((a,n) => a + n.x, 0) / count;
      const centerY = state.graph.nodes.reduce((a,n) => a + n.y, 0) / count;

      const stateIds = Array.apply(null, {length: count})
        .map(Number.call, Number);

      stateIds.sort((a,b) => {
        const posA = state.graph.nodes.get(a);
        const posB = state.graph.nodes.get(b);
        const angleA = Math.atan2(centerY - posA.y, centerX - posA.x);
        const angleB = Math.atan2(centerY - posB.y, centerX - posB.x);

        return Math.sign(
          angleB - angleA
        );
      });

      return O.fromArray(stateIds).map((nodeIndex, i) => {
        const angle = (-Math.PI / 2 - Math.PI * 2 * i) / count;

        const circumference = state.nodeRadius * 4 * Math.max(7, count);
        const radius = circumference / 2 / Math.PI;

        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        return {
          action: 'moveNode',
          index: nodeIndex,
          x,
          y,
        };
      });
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

  ])
;
