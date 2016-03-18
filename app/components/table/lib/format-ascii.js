
// get an array of widths of the table columns
const colWidths = (table) => {
  return table.columnGroups.map(
    (group) => group.columns.map((col) => col.name.length)
  );
};

// create a string representing a horiontal line between
// the table head and the table body
const ruler = (widths) => {
  return widths.map(
      (g) => '|' + g.map(
        (w) => new Array(w + 1 + 2).join('=')
      ).join('|') + '|'
    ).join('');
};

// create a string representing a table header
const header = (table) => {
  return table.columnGroups.map(
    (group) => '|' + group.columns
      .map((col) => ` ${col.name} `)
      .join('|') + '|'
  ).join('');
};

// create a string representing a table row
const row = (values, widths) => {
  return widths.reduce(
    ({baseIndex, acc}, colGroup) => ({
      baseIndex: baseIndex + colGroup.length,
      acc:
        acc +
        '|' +
        colGroup.map(
          (w, ci) => {
            const width = w + 2;
            const v = values[baseIndex + ci].toString();
            const delta2 = (width - v.length) / 2;
            return new Array(Math.ceil(delta2) + 1).join(' ') +
              v +
              new Array(Math.floor(delta2) + 1).join(' ');
          }
        ).join('|') +
        '|',
    }),
    {baseIndex: 0, acc: ''}
  ).acc;
};

// create a string representing the table as asci
export default (table) => {
  if (table === null) {
    return '';
  }
  const widths = colWidths(table);

  const head = header(table, widths);
  const headRuler = ruler(widths);
  const rows = table.rows.map((r) => row(r.values, widths));

  return head + "\n" +
    headRuler + '\n' +
    rows.join('\n');
};
