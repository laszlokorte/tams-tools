const colWidhts = (table) => {
  return table.columnGroups.map(
    (group) => group.columns.map((col) => col.name.length)
  );
};

const ruler = (widths) => {
  return widths.map(
      (g) => '|' + g.map(
        (w) => new Array(w + 1 + 2).join('=')
      ).join('|') + '|'
    ).join('');
};

const header = (table) => {
  return table.columnGroups.map(
    (group) => '|' + group.columns
      .map((col) => ` ${col.name} `)
      .join('|') + '|'
  ).join('');
};

const row = (values, widths) => {
  return widths.reduce(
    ({i,acc}, colGroup) => {
      return {
        i: i + colGroup.length,
        acc:
          acc +
          '|' +
          colGroup.map(
            (w, ci) => {
              const width = w + 2;
              const v = values[i + ci].toString();
              const delta2 = (width - v.length) / 2;
              return new Array(Math.ceil(delta2) + 1).join(' ') +
                v +
                new Array(Math.floor(delta2) + 1).join(' ');
            }
          ).join('|') +
          '|',
      };
    }, {i: 0, acc: ''}
  ).acc;
};

export default (table) => {
  if (table === null) {
    return '';
  }
  const widths = colWidhts(table);

  const head = header(table, widths);
  const headRuler = ruler(widths);
  const rows = table.rows.map((r) => row(r.values, widths));

  return head + "\n" +
    headRuler + '\n' +
    rows.join('\n');
};
