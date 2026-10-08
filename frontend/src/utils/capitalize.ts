export const capitalizeAllWords = (str: string) => {
  return str
    .split(' ')//passa para um array de palavras
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};