import requestAnimationFrame from 'raf';

// This driver consumes an Observable of dom elements
// and adjusts it's height to remove vertical scrollbars.
export const autoResizeDriver = (event$) => {
  let animating = null;
  event$.subscribe((element) => {
    if (animating) {
      return;
    }
    animating = requestAnimationFrame(() => {
      animating = null;
      element.style.height = '0px';
      element.style.height = element.scrollHeight + 'px';
    });
  });

  return Object.create(null);
};
