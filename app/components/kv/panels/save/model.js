import {Observable as O} from 'rx';

export default (pla$, json$) => {
  return O.combineLatest(
      pla$,
      json$,
      (pla, json) => ({
        pla,
        json,
      })
    )
  ;
};
