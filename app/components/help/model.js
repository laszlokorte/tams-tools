import {Observable as O} from 'rx';

export default (visible$, content$, actions) =>
  O.combineLatest(
    O.merge(
      visible$.startWith(false),
      actions.help$
    ),
    content$,
    (visible, content) => ({
      visible,
      content,
    })
  )
;
