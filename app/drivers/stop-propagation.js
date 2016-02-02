// This driver consumes an Observable of dom event objects
// and stops their propagation through the dom tree
export const stopPropagationDriver = (event$) => {
  event$.subscribe((evt) => {
    evt.stopPropagation();
  });

  return Object.create(null);
};
