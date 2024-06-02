export const CONFIG = {
  WIDTH: 800,
  HEIGHT: 500,

  inWidth: (n: number, padding: number = 0) => {
    return Math.max(Math.min(n, CONFIG.WIDTH - padding), padding);
  },

  inHeight: (n: number, padding: number = 0) => {
    return Math.max(Math.min(n, CONFIG.HEIGHT - padding), padding);
  },
};
