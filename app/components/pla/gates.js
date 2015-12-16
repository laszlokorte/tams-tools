import {svg} from '@cycle/dom';

import './gates.styl';

export const Rotation = {
  NORTH: 0,
  EAST: 1,
  SOUTH: 2,
  WEST: 3,
};

const inputOffsets = (count) => {
  let result = [];

  if (count % 2 === 1) {
    result.push(4);
  }
  if (count > 1) {
    if (count !== 4) {
      result.push(2);
      result.push(6);
    }
  }
  if (count > 3) {
    if (count !== 5) {
      result.push(1);
      result.push(7);
    }
    result.push(3);
    result.push(5);
  }

  const halfCount = Math.floor(count / 2);

  for (let i = 3; i <= halfCount; i++) {
    result.push(4 - i);
    result.push(4 + i);
  }

  result.sort();

  return result;
};

const inputPorts = (count, type) =>
  svg('g', {
    attributes: {
      'clip-path': 'url(#' + type + 'ClipPath)',
      class: 'gate-input-collection',
    },
  }, inputOffsets(count).map((y) =>
    svg('line', {
      x1: -50,
      y1: -40 + 10 * y,
      x2: 0,
      y2: -40 + 10 * y,
      class: 'gate-port',
    })
  ))
;

const inputExtension = (indent, count, bodyWidth) => {
  const extraHeight = Math.ceil(
    (count - (bodyWidth / 10)) / 2
  ) * 10;
  const halfWidth = bodyWidth / 2;
  return extraHeight > 0 && [
    svg('line', {
      attributes: {
        x1: -55 + indent,
        y1: -halfWidth,
        x2: -55 + indent,
        y2: -(halfWidth - 3) - extraHeight,
        class: 'gate-input-extension',
      },
    }),
    svg('line', {
      attributes: {
        x1: -55 + indent,
        y1: halfWidth,
        x2: -55 + indent,
        y2: (halfWidth - 3) + extraHeight,
        class: 'gate-input-extension',
      },
    }),
  ] || null;
}
;

const outputFeature = () =>
  svg('line', {
    attributes: {
      x1: 0,
      y1: 0,
      x2: 60,
      y2: 0,
      class: 'gate-port',
    },
  })
;

const negatorFeature = () =>
  svg('circle', {
    attributes: {
      cx: 38,
      cy: 0,
      r: 8,
      class: 'gate-body',
    },
  })
;

const exclusionFeature = () =>
  svg('path', {
    attributes: {
      d: `M-45,35
      c0,0 17.5,-3 17.5,-35
      c0,-32.5 -17.5,-35 -17.5,-35`,
      class: 'gate-body-extra',
    },
  })
;

const orMaskFeature = (offset = 0) =>
  svg('path', {
    attributes: {
      d: `M${-35 + offset},35
      c0,0 17.5,-3 17.5,-35
      c0,-32.5 -17.5,-35 -17.5,-35`,
      class: 'gate-body-extra',
    },
  })
;

const orBodyFeature = () =>
  svg('path', {
    attributes: {
      d: `M-35,35c-0,0 17.5,-3 17.5,-35
      c0,-32.5 -17.5,-35 -17.5,-35
      c27.5,3 45,0 65,35
      c-15,32 -32.5,32.5 -65,35Z`,
      class: 'gate-body',
    },
  })
;

const andBodyFeature = () =>
  svg('path', {
    attributes: {
      d: `M-30,35
      l0,-70
      l30,0
      c15,0 30,15 30,35
      c0,20 -15,35 -30,35Z`,
      class: 'gate-body',
    },
  })
;

const bufferBodyFeature = () =>
  svg('path', {
    attributes: {
      d: `M-5,-25
      l35,25
      l-35,25Z`,
      class: 'gate-body',
    },
  })
;

const composedGate = ({inputIndent, type, features, bodyWidth = 70}) => {
  return ({center: {x, y}, inputCount, rotation = Rotation.EAST}) => {
    const angle = 90 * (rotation - 1);
    const centerX = (x * 10);
    const centerY = (y * 10);

    return svg('g', {
      transform: 'translate(' + centerX + ' ' + centerY + ') ' +
        'rotate(' + angle + ')',
      class: 'gate gate-type-' + type,
    }, [
      inputPorts(inputCount, type),
      inputExtension(inputIndent, inputCount, bodyWidth),
      features.map((feat) => feat()),
    ]);
  };
};

const inputClipPath = (type, indent, extra) =>
  svg('clipPath', {
    attributes: {id: type + 'ClipPath'},
  }, [
    svg('rect', {
      attributes: {
        x: -60,
        y: -200,
        width: indent + 5,
        height: 400,
      },
    }),
    extra,
  ])
;

export const clipPaths = () =>
  svg('defs', [
    inputClipPath('xnor', 10, orMaskFeature(-10)),
    inputClipPath('xor', 10, orMaskFeature(-10)),
    inputClipPath('nor', 20, orMaskFeature()),
    inputClipPath('or', 20, orMaskFeature()),
    inputClipPath('nand', 25),
    inputClipPath('and', 25),
    inputClipPath('buffer', 50),
    inputClipPath('negator', 50),
  ])
;

export const gates = {
  and: composedGate({
    type: 'and',
    inputIndent: 25,
    features: [outputFeature, andBodyFeature],
  }),

  nand: composedGate({
    type: 'nand',
    inputIndent: 25,
    features: [outputFeature, andBodyFeature, negatorFeature],
  }),

  or: composedGate({
    type: 'or',
    inputIndent: 20,
    features: [outputFeature, orBodyFeature],
  }),

  nor: composedGate({
    type: 'nor',
    inputIndent: 20,
    features: [outputFeature, orBodyFeature, negatorFeature],
  }),

  xor: composedGate({
    type: 'xor',
    inputIndent: 10,
    features: [outputFeature, orBodyFeature, exclusionFeature],
  }),

  xnor: composedGate({
    type: 'xnor',
    inputIndent: 10,
    features: [outputFeature, orBodyFeature, exclusionFeature, negatorFeature],
  }),

  buffer: composedGate({
    type: 'buffer',
    inputIndent: 50,
    bodyWidth: 50,
    features: [outputFeature, bufferBodyFeature],
  }),

  negator: composedGate({
    type: 'negator',
    inputIndent: 50,
    bodyWidth: 50,
    features: [outputFeature, bufferBodyFeature, negatorFeature],
  }),
};
