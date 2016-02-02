import {fromJSON} from '../lib/table';

export default (table$, actions) => {
  return table$
    .map(fromJSON)
    .flatMapLatest((table) => {
      return actions.selectRow$
        .startWith(table ? table.selectedRow : null)
        .scan((prev, val) => prev === val ? null : val)
        .map((index) => ({
          table,
          selectedIndex: index,
        }));
    });
};
