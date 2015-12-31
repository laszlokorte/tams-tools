import {Observable as O} from 'rx';

export const keyboardDriver = () => {
  return O.fromEventPattern(
    (h) => {
      document.addEventListener('keydown', h, true);
    },
    (h) => {
      document.removeEventListener('keydown', h, true);
    }
  );
};
