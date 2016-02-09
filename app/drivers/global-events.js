import {Observable as O} from 'rx';

// This driver captures global events
// and provides them as Observable
export const globalEventDriver = () => {
  return {
    events: (eventName) => {
      return O.fromEventPattern(
        (h) => {
          document.addEventListener(eventName, h, true);
        },
        (h) => {
          document.removeEventListener(eventName, h, true);
        }
      );
    },
  };
};
