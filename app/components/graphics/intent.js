import {preventDefault} from '../../lib/utils';

const svgEventPosition = (evt) => {
  const svg = evt.target.ownerSVGElement || evt.target;
  const pt = svg.createSVGPoint();
  pt.x = evt.clientX;
  pt.y = evt.clientY;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
};

export default (DOM) => {
  return {
    zoom$:
      DOM
        .select('.graphics-root')
        .events('wheel')
        .do(preventDefault)
        .map((evt) => {
          const pivot = svgEventPosition(evt);
          const wheel = evt.deltaY / -40;
          const factor = Math.pow(1 + Math.abs(wheel) / 2 , wheel > 0 ? 1 : -1);

          return {
            factor,
            pivot,
          };
        }),
  };
};
