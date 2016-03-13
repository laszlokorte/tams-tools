export const generateUnique = (set, generator, i = set.size) => {
  const newName = generator(i);

  if (set.contains(newName)) {
    return generateUnique(set, generator, i + 1);
  } else {
    return newName;
  }
};
