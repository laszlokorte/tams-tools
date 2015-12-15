import {Observable as O} from 'rx';

export default (visible$, content$, actions) =>
  O.merge(
    visible$.startWith(false),
    actions.close$.map(() => false)
  ).map(
    (visible) => ({
      visible,
      content$,
    })
  )
;
