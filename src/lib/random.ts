export const shuffle = (array: any[]) => {
  let currentIndex = array.length,
    randomIndex;
  while (currentIndex > 0) {
    randomIndex = Math.floor(Math.random() * currentIndex--);
    array[currentIndex] = [
      array[randomIndex],
      (array[randomIndex] = array[currentIndex]),
    ][0];
  }
  return array;
};
