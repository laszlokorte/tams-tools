import {
  div, button ,span,
} from '@cycle/dom';

import plusIcon from '../../../../icons/plus';
import minusIcon from '../../../../icons/minus';

import './index.styl';

export default ({attributes, label, readonly, value, min, max}) =>
  div('.spinner' + (
    (readonly ? '.state-readonly' : '')
  ), {
    attributes: attributes,
  }, [
    span('.spinner-label', label),
    button('.spinner-button', {
      attributes: {'data-spinner-action': 'decrement'},
      disabled: min >= value,
    }, minusIcon(24)),
    span('.spinner-value', value.toString()),
    button('.spinner-button', {
      attributes: {'data-spinner-action': 'increment'},
      disabled: max <= value,
    }, plusIcon(24)),
  ])
;
