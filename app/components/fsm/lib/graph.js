export default (stateMachine) => {
  return {
    nodes: [
      {
        label: 'A',
        x: 0,
        y: 0,
      },
      {
        label: 'B',
        x: 500,
        y: 250,
      },{
        label: 'C',
        x: 500,
        y: -750,
      },
    ],
    edges: [
      {from: 0, to: 1},
      {from: 0, to: 2},
      {from: 0, to: 0},
      {from: 1, to: 1},
      {from: 1, to: 0},
    ],
  };
};
