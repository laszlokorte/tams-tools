import {Observable as O} from 'rx';

export default (visible$, content$, actions) =>
  O.merge([
    // by default the modal window is not visible
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
