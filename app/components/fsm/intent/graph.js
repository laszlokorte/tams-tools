import {Observable as O} from 'rx';

export default (graphAction$) => {
  return {
    addState$: graphAction$
      .filter(({action}) => action === 'createNode')
      .map(({x,y}) => ({x, y})),
    moveState$: graphAction$
      .filter(({action}) => action === 'moveNode')
      .map(({index, x, y}) => ({index, x, y})),
    addTransition$: graphAction$
      .filter(({action}) => action === 'connectNodes')
      .map(({fromIndex, toIndex}) => ({fromIndex, toIndex})),
  };
};
