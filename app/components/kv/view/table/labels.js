const _labelFor = ({inputs, offset}, rowsOrColumns, {include, exclude}) => {
  if (rowsOrColumns.size > include &&
    rowsOrColumns.size > exclude
    ) {
    const intersect = rowsOrColumns.get(exclude)
      .not().and(rowsOrColumns.get(include));
    return inputs.get(offset + intersect.msb()).name;
  } else {
    return null;
  }
};

export default ({rows, cols, offset, inputs}) => ({
  top: _labelFor({inputs, offset}, cols, {
    include: 1,
    exclude: 0,
  }),
  bottom: _labelFor({inputs, offset}, cols, {
    include: 2,
    exclude: 1,
  }),
  left: _labelFor({inputs, offset}, rows, {
    include: Math.ceil(rows.size / 2),
    exclude: Math.ceil(rows.size / 2 - 1),
  }),
  right: _labelFor({inputs, offset}, rows, {
    include: 1,
    exclude: 3,
  }),
});
