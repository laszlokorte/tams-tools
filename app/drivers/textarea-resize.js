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

      /*
        usually just this would work:
        element.style.height = element.scrollHeight + 'px';

        but in firefox 18 scrollHeight does not include padding
      */

      element.style.height = '0px';
      const paddingVertical = element.offsetHeight;
      element.style.padding = '0px';
      const newHeight = element.scrollHeight + paddingVertical;
      element.style.padding = null;
      element.style.height = newHeight + 'px';
    });
  });

  return Object.create(null);
};
