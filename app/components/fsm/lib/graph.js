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
        x: 100,
        y: 50,
      },{
        label: 'C',
        x: 100,
        y: -150,
      },
    ],
    edges: [
      {from: 0, to: 1},
      {from: 1, to: 2},
      {from: 2, to: 0},
      {from: 0, to: 0},
      {from: 1, to: 0},
    ],
  };
};
