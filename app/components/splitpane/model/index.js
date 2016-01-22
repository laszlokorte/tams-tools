import {ContentThunk} from './contentThunk';
import {clamp} from '../../../lib/utils';

export default ({props$, firstChild$, secondChild$}, actions) => {
  return props$.map((props) =>
    actions.resize$.startWith(props.proportion).map((proportion) => ({
      proportion: clamp(proportion, 0.1, 0.9),
      firstChild$: firstChild$.map((content, index) => {
        return new ContentThunk(content, index % 2);
      }),
      secondChild$,
    }))
  ).switch();
};
