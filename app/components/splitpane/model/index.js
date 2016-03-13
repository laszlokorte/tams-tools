import {Observable as O} from 'rx';
import {clamp} from '../../../lib/utils';

export default ({props$, firstChild$, secondChild$}, actions) => {
  const firstChild$shared = firstChild$.shareReplay(1);
  const secondChild$shared = secondChild$.shareReplay(1);

  return props$.map((props) =>
      O.combineLatest(
        actions.resize$.startWith(props.proportion),
        firstChild$shared.startWith(null),
        secondChild$shared.startWith(null),
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
  .switch()
  .shareReplay(1);
};
