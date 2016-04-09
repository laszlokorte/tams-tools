import {Observable as O} from 'rx';

export default (json$) =>
  O.combineLatest(
    json$.startWith(''),
    (json) => ({
      json,
    })
  )
  .shareReplay(1)
;

