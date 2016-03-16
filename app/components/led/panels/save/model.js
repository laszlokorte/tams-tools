import {Observable as O} from 'rx';

export default (table$/*, actions*/) =>
  O.combineLatest(
    table$.startWith(''),
    (table) => ({
      table,
    })
  )
  .shareReplay(1)
;
