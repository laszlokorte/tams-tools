import {clamp} from '../../../lib/utils';

export default ({props$, firstChild$, secondChild$}, actions) => {
  return props$.map((props) =>
    actions.resize$
      .startWith(props.proportion)
      .map((proportion) => {
        return {
          proportion:
            clamp(proportion, 0.1, 0.9),
          firstChild$: firstChild$,
          secondChild$: secondChild$,
        };
      })
  )
  .switch();
};
