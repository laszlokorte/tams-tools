import {clamp} from '../../../lib/utils';

export default ({props$, firstChild$, secondChild$}, actions) => {
  const firstChild$shared = firstChild$.shareReplay(1);
  const secondChild$shared = secondChild$.shareReplay(1);

  return props$.map((props) =>
    actions.resize$
      .startWith(props.proportion)
      .combineLatest(
        firstChild$shared,
        secondChild$shared,
        (proportion, firstChild, secondChild) => {
          return {
            proportion:
              clamp(proportion, 0.1, 0.9),
            firstChild,
            secondChild,
          };
        }
      )
  )
  .switch();
};
