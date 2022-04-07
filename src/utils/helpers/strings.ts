/* Takes in a string and capitalizes the first letter */
export const capitalizeFirstLetter = (string: string) =>
  string[0].toUpperCase() + string.slice(1).toLowerCase();
