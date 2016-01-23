import {Observable as O} from 'rx';

export default (table$, json$, visible$, actions) => {
  return O.merge(
      actions.finish$.map(() => false),
      visible$.startWith(false)
    ).shareReplay(1)
  .combineLatest(
    actions.selectAll$.startWith(true),
    (visible) => ({
      props: {visible},
      table$,
      json$,
    })
  )
  ;
};
