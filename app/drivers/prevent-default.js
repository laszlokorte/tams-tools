export const preventDefaultDriver = (event$) => {
  event$.subscribe((evt) => {
    evt.preventDefault();
  });

  return Object.create(null);
};
