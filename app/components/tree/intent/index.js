import {Observable as O} from 'rx';

// Currently there are no input events processed

export default () => {
  return {
    click$: O.just(true),
    preventDefault: O.empty(),
  };
};
