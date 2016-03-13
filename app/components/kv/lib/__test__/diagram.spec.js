import test from 'ava';

import {
  MODE_DNF, MODE_KNF,
  newDiagram,
  isValidValueForMode,
  isValidOutputName
} from '../diagram';

test('New Diagram has 3 Inputs', (t) => {
  t.is(newDiagram().inputs.size, 3);
});

test('Allowed Output names', (t) => {
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
