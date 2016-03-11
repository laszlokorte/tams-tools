import {Observable as O} from 'rx';

export default (DOM) => {
  const dot = DOM.select('[data-dot-index]');
  const dotClick$ = dot
    .events('mousedown', {useCapture: true})
    .share();

  return {
    selectBit$: dotClick$.map(
        (evt) => parseInt(
          evt.ownerTarget.getAttribute('data-dot-index'),
          10
        )
      ),

    preventDefault: O.empty(),
    stopPropagation: dotClick$,
  };
};
