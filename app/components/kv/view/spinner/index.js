import {
  div, button ,span,
} from '@cycle/dom';

export default ({attributes, label, readonly, value, min, max}) =>
  div('.spinner' + (
    (readonly ? '.state-readonly' : '')
  ), {
    attributes: attributes,
  }, [
    span('.spinner-label', label),
    button('.spinner-button-decrement', {
      attributes: {'data-spinner-action': 'decrement'},
      disabled: min >= value,
    }, 'Decrement'),
    span('.spinner-value', value.toString()),
    button('.spinner-button-increment', {
      attributes: {'data-spinner-action': 'increment'},
      disabled: max <= value,
    }, 'Increment'),
  ])
;
