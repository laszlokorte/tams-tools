import {Observable as O} from 'rx';

import panelActions from './panels';

export default ({DOM, openData$}) => {
  const subExpressionCheckbox = DOM
    .select('input[name="subexpressions"]');
  const formatSelect = DOM
    .select('.format-select');

  const subExprEvent$ = subExpressionCheckbox.events('change');

  const selectFormatEvent$ = formatSelect.events('change');

  const panels = panelActions({DOM});

  return {
    showSubExpressions$: subExprEvent$
      .map((evt) => evt.ownerTarget.checked)
      .share(),

    panel$: panels.open$,

    selectFormat$: selectFormatEvent$
      .map((evt) => evt.ownerTarget.value)
      .share(),

    openData$,

    preventDefault: O.merge([
      panels.preventDefault,
    ]),
  };
};
