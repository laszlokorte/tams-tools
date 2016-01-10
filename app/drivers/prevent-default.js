// This driver consumes an Observable of dom event objects
// and cancels their default behavior
export const preventDefaultDriver = (event$) => {
  event$.subscribe((evt) => {
    evt.preventDefault();
  });

  return Object.create(null);
};
