import {Observable as O} from 'rx';

export default (visible$, content$, actions) =>
  O.merge([
    visible$.startWith(false),
    actions.close$.map(() => false),
  ]).combineLatest(
    content$,
    (visible, content) => ({
      visible,
      content,
    })
  )
  .shareReplay(1)
;
