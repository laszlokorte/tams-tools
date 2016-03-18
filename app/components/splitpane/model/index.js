import {Observable as O} from 'rx';
import {clamp} from '../../../lib/utils';

// The minimal proportional size of each of the panes
const MIN_PROPORTION = 0.1; // 10%

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
            proportion: clamp(
              proportion,
              MIN_PROPORTION, (1 - MIN_PROPORTION)
            ),
            firstChild,
            secondChild,
          };
        }
      )
  )
  .switch()
  .shareReplay(1);
};
