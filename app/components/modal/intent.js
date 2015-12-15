import {preventDefault} from '../../lib/utils';

export default (DOM) => {
  return {
    close$:
      DOM
        .select('[data-modal-close]')
        .events('click')
        .do(preventDefault)
        .map(() => true),
  };
};
