// This driver consumes an Observable of dom elements
// and adjusts it's height to remove vertical scrollbars.
export const autoResizeDriver = (event$) => {
  event$.subscribe((element) => {
    element.style.height = '0px';
    element.style.height = element.scrollHeight + 'px';
  });

  return Object.create(null);
};
