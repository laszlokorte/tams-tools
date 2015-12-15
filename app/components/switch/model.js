import {Observable as O} from 'rx';

export default (props$, enabled$, actions) =>
  O.combineLatest(
    props$,
    O.merge(
      enabled$,
      actions.change$
    ),
    (props, enabled) => ({
      enabled,
      label: enabled ? props.onLabel : props.offLabel,
    })
  )
;
