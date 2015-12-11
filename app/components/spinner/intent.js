import {preventDefault} from '../../lib/utils';

export default (DOM) => {
  return {
    increment$:
      DOM
        .select('[data-increment]')
        .events('click')
        .do(preventDefault)
        .map(() => true),
    decrement$:
      DOM
        .select('[data-decrement]')
        .events('click')
        .do(preventDefault)
        .map(() => true),
  };
};
