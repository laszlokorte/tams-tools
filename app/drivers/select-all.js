// This driver consumes an Observable of dom elements
// and select their content.
export const selectAllDriver = (event$) => {
  event$.subscribe((element) => {
    element.setSelectionRange(0, 9999999);
  });

  return Object.create(null);
};
