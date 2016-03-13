import {Observable as O} from 'rx';

export default (pla$, json$) =>
  O.combineLatest(
    pla$.startWith({inputs: [], outputs: [], loops: []}),
    json$.startWith(''),
    (pla, json) => ({
      pla,
      json,
    })
  )
  .shareReplay(1)
;

