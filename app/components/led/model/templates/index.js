export default [
  {
    name: "7 Segment (Decimal)",
    inputs: ["x1","x2","x3","x4"],
    segments: require('./7-segment.json').segments,
    outputs: [
      [true, false, true, true,
      false, true, true, true,
      true, true, null, null,
      null, null, null, null],

      [true, true, true, true,
      true, false, false, true,
      true, true, null, null,
      null, null, null, null],

      [true, true, false, true,
      true, true, true, true,
      true, true, null, null,
      null, null, null, null],

      [true, false, true, true,
      false, true, true, false,
      true, true, null, null,
      null, null, null, null],

      [true, false, true, false,
      false, false, true, false,
      true, false, null, null,
      null, null, null, null],

      [true, false, false, false,
      true, true, true, false,
      true, true, null, null,
      null, null, null, null],

      [false, false, true, true,
      true, true, true, false,
      true, true, null, null,
      null, null, null, null],
    ],
  },
  {
    name: "7 Segment (Hex)",
    inputs: ["x1","x2","x3","x4"],
    segments: require('./7-segment.json').segments,
    outputs: [
      [true, false, true, true,
      false, true, true, true,
      true, true, true, false,
      true, false, true, true],

      [true, true, true, true,
      true, false, false, true,
      true, true, true, false,
      false, true, false, false],

      [true, true, false, true,
      true, true, true, true,
      true, true, true, true,
      false, true, false, false],

      [true, false, true, true,
      false, true, true, false,
      true, true, false, true,
      true, true, true, false],

      [true, false, true, false,
      false, false, true, false,
      true, false, true, true,
      true, true, true, true],

      [true, false, false, false,
      true, true, true, false,
      true, true, true, true,
      true, false, true, true],

      [false, false, true, true,
      true, true, true, false,
      true, true, true, true,
      false, true, true, true],
    ],
  },

  {
    name: "7 Segment (Blank)",
    inputs: ["x1","x2","x3","x4"],
    segments: require('./7-segment.json').segments,
    outputs: [
      [null, null, null, null, null, null, null, null,
      null, null, null, null, null, null, null, null],

      [null, null, null, null, null, null, null, null,
      null, null, null, null, null, null, null, null],

      [null, null, null, null, null, null, null, null,
      null, null, null, null, null, null, null, null],

      [null, null, null, null, null, null, null, null,
      null, null, null, null, null, null, null, null],

      [null, null, null, null, null, null, null, null,
      null, null, null, null, null, null, null, null],

      [null, null, null, null, null, null, null, null,
      null, null, null, null, null, null, null, null],

      [null, null, null, null, null, null, null, null,
      null, null, null, null, null, null, null, null],
    ],
  },

  {
    name: "Dice",
    inputs: ["x1","x2","x3"],
    segments: require('./dice.json').segments,
    outputs: [
      [false,false,true,true,true,true,true,null],
      [false,false,false,false,false,false,true,null],
      [false,false,false,false,true,true,true,null],
      [false,true,false,true,false,true,false,null],
      [false,false,false,false,true,true,true,null],
      [false,false,false,false,false,false,true,null],
      [false,false,true,true,true,true,true,null],
    ],
  },

  {
    name: "Dice (Blank)",
    inputs: ["x1","x2","x3"],
    segments: require('./dice.json').segments,
    outputs: [
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
    ],
  },

  {
    name: "16 Segment (Blank)",
    inputs: ["x1","x2","x3"],
    segments: require('./16-segment.json').segments,
    outputs: [
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
    ],
  },
];
