import {Observable as O} from 'rx';

export default (DOM) => {
  const tableRow = DOM.select('tr[data-index]');
  const rowEvent$ = tableRow.events('mousedown');

  return {
    selectRow$: rowEvent$
      .map((evt) => parseInt(evt.ownerTarget.dataset.index, 10))
      .share(),

    preventDefault: O.empty(),
  };
};
