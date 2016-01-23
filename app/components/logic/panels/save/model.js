import {Observable as O} from 'rx';

export default (table$/*, actions*/) => {
  return table$.map((table) => ({table}));
};
