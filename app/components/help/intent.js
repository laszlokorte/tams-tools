import {preventDefault, pluckDataAttr} from '../../lib/utils';

export default (DOM) => {
  return {
    help$:
      DOM
        .select('[data-help]')
        .events('click')
        .do(preventDefault)
        .map(pluckDataAttr('help'))
        .map((val) => val === 'true'),
  };
};
