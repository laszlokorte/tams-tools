import {Observable as O} from 'rx';

export default () => {
  return {
    click$: O.just(true),
  };
};
