export default (fsm) => {
  return {
    nodes: fsm.states.map((s) => ({
      label: s.name,
      x: s.position.x,
      y: s.position.y,
    })).toArray(),
    edges: fsm.states.map((s, fromIndex) =>
      s.transitions.map((t) => ({
        label: '(in1 ∧ ¬in2) ∨ ¬in2',
        from: fromIndex,
        to: t.target,
      }))
    ).flatten().toArray(),
  };
};
