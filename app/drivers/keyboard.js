import {Observable as O} from 'rx';

// This driver captures global key down event
// and provides them as Observable
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
