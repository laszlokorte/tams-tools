import {preventDefault} from '../../lib/utils';

export default (DOM) => {
  return {
    change$:
      DOM
        .select('[data-switch-state]')
        .events('click')
        .do(preventDefault)
        .map((evt) =>
          evt.target.dataset.switchState === 'true'
        ),
  };
};
