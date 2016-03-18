// This driver consumes an Observable of dom elements
// and select their content.
export const selectAllDriver = (event$) => {
  event$.subscribe((element) => {
    // select everything from the first charactor to the 999999th
    // which is hopefuly beyond the last one.
    element.setSelectionRange(0, 9999999);
  });

  return Object.create(null);
};
