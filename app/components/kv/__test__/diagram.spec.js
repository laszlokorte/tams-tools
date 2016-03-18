import test from 'ava';

import {
  MODE_DNF, MODE_KNF,
  newDiagram,
  isValidValueForMode,
  isValidOutputName,
  modeFromName,
  intToCell,
  cellToInt,
} from '../lib/diagram';

test('New Diagram has 3 Inputs', (t) => {
  t.is(newDiagram().inputs.size, 3);
});

test('KV Allowed Output names', (t) => {
  const validNames = [
    "A", "Foo", "Test123",
  ];

  const invalidNames = [
    "",
    "SomeVeryLongNameThatIsJustTooLong",
    "Name with Space",
  ];

  validNames.forEach((name) => {
    t.true(isValidOutputName(name));
  });

  invalidNames.forEach((name) => {
    t.false(isValidOutputName(name));
  });
});

test('KV Mode names', (t) => {
  const dnf = modeFromName('dnf');
  const knf = modeFromName('knf');

  t.is(dnf, MODE_DNF);
  t.is(knf, MODE_KNF);

  t.is(dnf.name, 'dnf');
  t.is(knf.name, 'knf');
});

test('DNF: valid values', (t) => {
  t.true(isValidValueForMode(true, MODE_DNF));
  t.false(isValidValueForMode(false, MODE_DNF));
  t.true(isValidValueForMode(null, MODE_DNF));
});

test('KNF: valid values', (t) => {
  t.false(isValidValueForMode(true, MODE_KNF));
  t.true(isValidValueForMode(false, MODE_KNF));
  t.true(isValidValueForMode(null, MODE_KNF));
});

test('Int/Cell conversion', (t) => {
  [
    0, 1, 5, 10, 12, 13,
    Math.pow(2, 20),
  ].forEach((int) => {
    t.is(cellToInt(intToCell(int)), int);
  });
});

test.todo('loopBelongsToOutput');
test.todo('insideCube');
test.todo('insideCubeMasked');
test.todo('insideLoop');
test.todo('isValidCubeForValuesInMode');
test.todo('appendInput');
test.todo('popInput');
test.todo('renameInput');
test.todo('appendOutput');
test.todo('removeOutput');
test.todo('renameOutput');
test.todo('appendLoop');
test.todo('removeLoop');
test.todo('removeLoopFromOutput');
test.todo('setValue');
test.todo('getValue');
test.todo('newCubeFromTo');
test.todo('newLoop');
test.todo('fromJSON');
test.todo('toJSON');
test.todo('toPLA');
