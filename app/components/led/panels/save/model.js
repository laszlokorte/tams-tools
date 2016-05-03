import {Observable as O} from 'rx';

export default (table$, formula$/*, actions*/) =>
  O.combineLatest(
    formula$.startWith(''),
    table$.startWith(''),
    (formula, table) => ({
      formula,
      table,
    })
  )
  .shareReplay(1)
;
