import {Observable as O} from 'rx';

import model from './model';
import view from './view';
import intent from './intent';

export default ({
  DOM, // DOM driver source
  table$ = O.just({ // the tabel data to display
    columnGroups: [ // the columns groups of the table
      {
        name: "Column Group 1", // name of the group
        columns: [ // the columns of this group
          {name: "First Column"}, // columns have names
          {name: "Second Column"},
        ],
      },
    ],
    rows: [ // the content of the table
      { // first row
        values: [
          // each row has so much values as
          // the total number of columns
          "First value", "the first row",
        ],
      },
      { // second row
        values: ["second", "row"],
      },
    ],
    selectedRow: null, // index of selected row, or null
    error: null, // Error message that is displayed instead of the rows
  }),
}) => {
  const actions = intent(DOM);
  const state$ = model(table$, actions);
  const vtree$ = view(state$);

  return {
    DOM: vtree$,
    selectedRow$: state$.map(
      // index of the currently selected table row
      ({selectedIndex}) => selectedIndex
    ),
  };
};
