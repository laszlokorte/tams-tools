import {svg} from '@cycle/dom';

import {attrBool} from '../../../lib/h-helper';

import {Rotation} from '../lib/layout';

import './gates.styl';

/*
   This file contains the svg definitions
   for all the gates
*/

// Get an array of positions for the input ports
// for a given number of inputs
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
    if (count < 5) {
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

  result.sort((a,b) => a - b);

  return result;
};

// Get a solder point for the given position
const soderPoint = (x,y) =>
  svg('circle', {
    attributes: {
      cx: x,
      cy: y,
      r: 4,
      class: 'wire-soder',
    },
  })
;

// Get a number of input ports for the given
// type of gate
// soder defines if the pins should have soder
 // points drawn to them
const inputPorts = (count, type, soder) =>
  svg('g', {
    attributes: {
      'clip-path': 'url(#' + type + 'ClipPath)',
      class: 'gate-input-collection',
    },
  }, inputOffsets(count).map((y) => [
    soder ? soderPoint(-50, -40 + 10 * y) : null,
    svg('line', {
      x1: -50,
      y1: -40 + 10 * y,
      x2: 0,
      y2: -40 + 10 * y,
      'stroke-width': 2,
      class: 'gate-port',
    }),
  ]))
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

// Get an output port
const outputFeature = (soder) => [
  soder ? soderPoint(50, 0) : null,
  svg('line', {
    attributes: {
      x1: 0,
      y1: 0,
      x2: 50,
      y2: 0,
      'stroke-width': 2,
      class: 'gate-port',
    },
  }),
]
;

// Get a short wire of the siz of a gate
// which can be used to replace a gate
// with a single port
const passThroughWire = (color) => [
  svg('line', {
    attributes: {
      x1: -30,
      y1: 0,
      x2: 0,
      y2: 0,
      'stroke-width': 2,
      stroke: color || 'black',
      class: 'gate-omitted',
    },
  }),
]
;

// Convert a signal value into a string
const signalName = (signal) =>
  signal === null ?
  '?' : signal.toString()
;

// Get a replacement for a gate that is not needed
// (A gate with 0 or 1 input ports)
const omitGate = (color, angle, inputCount, defaultSignal) => {
  if (inputCount === 1) {
    return passThroughWire(color);
  } else if (inputCount === 0) {
    return [
      passThroughWire(color),
      svg('text', {
        x: 0,
        y: 0,
        'text-anchor': 'middle',
        'alignment-baseline': 'middle',
        class: 'signal-name',
        transform: `translate(-50, 0) rotate(${-angle})`,
      }, signalName(defaultSignal)),
    ];
  } else {
    return [];
  }
};

// The shape of a inverter
const inverterFeature = (color) =>
  svg('circle', {
    attributes: {
      cx: 38,
      cy: 0,
      r: 8,
      class: 'gate-body',
      stroke: attrBool(color),
    },
  })
;

// The line that distinguishes an OR gates
// from a XOR gate
const exclusionFeature = (color) =>
  svg('path', {
    attributes: {
      d: `M-45,35
      c0,0 17.5,-3 17.5,-35
      c0,-32.5 -17.5,-35 -17.5,-35`,
      class: 'gate-body-extra',
      stroke: attrBool(color),
    },
  })
;

// The shape in which the input pins on an OR gate
// are cutted to fit the gate.
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

// The shape of an OR gate
const orBodyFeature = (color) =>
  svg('path', {
    attributes: {
      d: `M-35,35c-0,0 17.5,-3 17.5,-35
      c0,-32.5 -17.5,-35 -17.5,-35
      c27.5,3 45,0 65,35
      c-15,32 -32.5,32.5 -65,35Z`,
      class: 'gate-body',
      stroke: attrBool(color),
    },
  })
;

// The shape of an AND gate
const andBodyFeature = (color) =>
  svg('path', {
    attributes: {
      d: `M-30,35
      l0,-70
      l30,0
      c15,0 30,15 30,35
      c0,20 -15,35 -30,35Z`,
      class: 'gate-body',
      stroke: attrBool(color),
    },
  })
;

// The shape of a buffer
const bufferBodyFeature = (color) =>
  svg('path', {
    attributes: {
      d: `M-5,-25
      l35,25
      l-35,25Z`,
      class: 'gate-body',
      stroke: attrBool(color),
    },
  })
;

// create a function the returns a gate composed
// of multiple parts
const composedGate = ({
  inputIndent, type,
  features, bodyWidth = 70,
  canOmit, defaultSignal = null,
}) => {
  return ({
    key,
    center: {x, y},
    inputCount,
    rotation = Rotation.EAST,
    soderOutput = false,
    soderInput = false,
    color,
    highlight,
    mayOmit,
  }) => {
    const angle = 90 * (rotation - 1);
    const centerX = (x * 10);
    const centerY = (y * 10);

    return svg('g', {
      key: 'gate-' + key,
      transform: 'translate(' + centerX + ' ' + centerY + ') ' +
        'rotate(' + angle + ')',
      class: 'gate gate-type-' + type +
        (highlight ? ' state-highlight' : ''),
    }, [
      outputFeature(soderOutput),
      inputPorts(inputCount, type, soderInput),
      (mayOmit && canOmit && inputCount < 2 &&
        (defaultSignal !== null || inputCount > 0)
      ) ? [
        omitGate(color, angle, inputCount, defaultSignal),
      ] : [
        inputExtension(inputIndent, inputCount, bodyWidth),
        features.map((feat) => feat(color)),
      ],
    ]);
  };
};

// Get a mask for clipping the input ports to make
// them fit the shape of the gate
const inputClipPath = ({type, size, indent, extra}) =>
  svg('clipPath', {
    attributes: {id: type + 'ClipPath'},
  }, [
    svg('rect', {
      attributes: {
        x: -60,
        y: -size / 2,
        width: indent + 5,
        height: size,
      },
    }),
    extra,
  ])
;

// The list of all masks used to clip the input ports
export const clipPaths = (size = 400) =>
  svg('defs', [
    inputClipPath({type: 'xnor', indent: 10, size, extra: orMaskFeature(-10)}),
    inputClipPath({type: 'xor', indent: 10, size, extra: orMaskFeature(-10)}),
    inputClipPath({type: 'nor', indent: 20, size, extra: orMaskFeature()}),
    inputClipPath({type: 'or', indent: 20, size, extra: orMaskFeature()}),
    inputClipPath({type: 'nand', indent: 25, size}),
    inputClipPath({type: 'and', indent: 25, size}),
    inputClipPath({type: 'buffer', indent: 50, size}),
    inputClipPath({type: 'inverter', indent: 50, size}),
  ])
;

// functions to generate wires
export const wires = {
  // Get a vertical wire
  vertical: ({key, from, toY, input, inputCount, soderStart, soderEnd}) => {
    const startX = -40 + 10 * (from.x + inputOffsets(inputCount)[input]);
    const startY = 10 * from.y;
    const endX = startX;
    const endY = 10 * toY;

    return svg('g', {
      key: 'wire-vertical-' + key,
    }, [
      soderStart ? soderPoint(startX, startY) : null,
      soderEnd ? soderPoint(endX, endY) : null,
      svg('line', {
        x1: startX,
        y1: startY,
        x2: endX,
        y2: endY,
        'stroke-width': 2,
        class: 'wire wire-vertical',
      }),
    ]);
  },

  // Get an horizontal wire
  horizontal: ({key, from, toX, input, inputCount, soderStart, soderEnd}) => {
    const startX = 10 * from.x;
    const startY = -40 + 10 * (from.y + inputOffsets(inputCount)[input]);
    const endX = 10 * toX;
    const endY = startY;

    return svg('g', {
      key: 'wire-horizontal-' + key,
    }, [
      soderStart ? soderPoint(startX, startY) : null,
      soderEnd ? soderPoint(endX, endY) : null,
      svg('line', {
        x1: startX,
        y1: startY,
        x2: endX,
        y2: startY,
        'stroke-width': 2,
        class: 'wire wire-horizontal',
      }),
    ]);
  },
};

// functions to generate gate shapes
export const gates = {
  and: composedGate({
    type: 'and',
    inputIndent: 25,
    features: [andBodyFeature],
    canOmit: true,
    defaultSignal: 1,
  }),

  nand: composedGate({
    type: 'nand',
    inputIndent: 25,
    features: [andBodyFeature, inverterFeature],
  }),

  or: composedGate({
    type: 'or',
    inputIndent: 20,
    features: [orBodyFeature],
    canOmit: true,
    defaultSignal: 0,
  }),

  nor: composedGate({
    type: 'nor',
    inputIndent: 20,
    features: [orBodyFeature, inverterFeature],
  }),

  xor: composedGate({
    type: 'xor',
    inputIndent: 10,
    features: [orBodyFeature, exclusionFeature],
  }),

  xnor: composedGate({
    type: 'xnor',
    inputIndent: 10,
    features: [orBodyFeature, exclusionFeature, inverterFeature],
  }),

  buffer: composedGate({
    type: 'buffer',
    inputIndent: 50,
    bodyWidth: 50,
    features: [bufferBodyFeature],
    canOmit: true,
  }),

  inverter: composedGate({
    type: 'inverter',
    inputIndent: 50,
    bodyWidth: 50,
    features: [bufferBodyFeature, inverterFeature],
    defaultSignal: 1,
  }),
};
