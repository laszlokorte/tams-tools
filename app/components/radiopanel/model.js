import {Observable as O} from 'rx';

export default (props$, value$, actions) =>
  O.combineLatest(
    props$,
    value$,
    ({options, label}, defaultValue) =>
      actions.change$
        .filter((v) => options.some((o) => o.value === v))
        .startWith(defaultValue)
        .map((value) => ({
          options: options.map(
            (option) => ({
              enabled: value === option.value,
              value: option.value,
              label: option.label,
            })
          ),
          label,
          value,
        }))
  ).switch()
;
