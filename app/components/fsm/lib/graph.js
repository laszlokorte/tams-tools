export default (fsm) => {
  return {
    nodes: fsm.states.map((s) => ({
      label: s.name,
      x: s.position.x,
      y: s.position.y,
    })).toArray(),
    edges: fsm.states.map((s, fromIndex) =>
      s.transitions.map((t) => ({
        label: t.condition,
        from: fromIndex,
        to: t.target,
      }))
    ).flatten().toArray(),
  };
};
