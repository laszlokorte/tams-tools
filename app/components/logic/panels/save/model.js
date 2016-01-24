import {Observable as O} from 'rx';

export default (table$, formular$/*, actions*/) =>
  O.combineLatest(
    table$.startWith(''),
    formular$.startWith(''),
    (table, formular) => ({
      table,
      formular,
    })
  )
;
