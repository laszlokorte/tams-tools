// generate a value that is not already in the given set
// by calling the given generator with an incrementing integer
// the generator must return different values for each
// paramter it is called with
export const generateUnique = (generator, set, i = set.size) => {
  const newName = generator(i);

  if (set.contains(newName)) {
    return generateUnique(generator, set, i + 1);
  } else {
    return newName;
  }
};
