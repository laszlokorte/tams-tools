import {Observable as O} from 'rx';

export default (pla$, json$, visible$, actions) => {
  return O.merge(
      actions.finish$.map(() => false),
      visible$.startWith(false)
    )
  .combineLatest(
    actions.selectAll$.startWith(true),
    (visible) => ({
      props: {visible},
      pla$,
      json$,
    })
  )
  ;
};
