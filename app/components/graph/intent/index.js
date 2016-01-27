import {Observable as O} from 'rx';

export default (DOM) => {
  return {
    preventDefault: O.empty(),
  };
};
