import {fromJSON} from '../lib/table';

export default (table$, actions) =>
  table$
  .map(fromJSON)
  .map((table) => {
    return actions.selectRow$
      .startWith(table ? table.selectedRow : null)
      .scan((prev, val) => prev === val ? null : val)
      .map((index) => ({
        table,
        selectedIndex: index,
      }));
  })
  .switch()
  .shareReplay(1)
;
