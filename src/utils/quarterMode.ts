import { QUARTER_ALIAS } from "../constants/quarterAlias";

export const enableTwoQuarterMode = (quarters: string[]) => {
  if (quarters.length === 2 && quarters.includes('Q1') && quarters.includes('Q2')) {
    return quarters.map(quarter => QUARTER_ALIAS[quarter as keyof typeof QUARTER_ALIAS]);
  } else {
    return quarters
  }
};
