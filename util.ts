export const toDecimals = (n: number, decimals: number) => {
  return Math.round(n * Math.pow(10, decimals)) / Math.pow(10, decimals);
};
