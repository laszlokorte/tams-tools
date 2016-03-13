import {Observable as O} from 'rx';

export default (table$, formula$/*, actions*/) =>
  O.combineLatest(
    table$.startWith(''),
    formula$.startWith(''),
    (table, formula) => ({
      table,
      formula,
    })
  )
  .shareReplay(1)
;
