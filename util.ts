import { Team } from "./game/globals";

export const toDecimals = (n: number, decimals: number) => {
  return Math.round(n * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

export const oppositeTeam = (team: Team): Team => {
  return team === Team.GREEN ? Team.PURPLE : Team.GREEN;
};
