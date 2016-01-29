import {Observable as O} from 'rx';

export default (DOM) => {
  const node = DOM.select('[data-node-index]');

  const dragStart$ = node
    .events('mousedown', {useCapture: true})
    .subscribe((e) => e.stopPropagation());

  return {
    preventDefault: O.empty(),
  };
};
