import { QUARTER_ALIAS } from "../constants/quarterAlias";

export const enableTwoQuarterMode = (quarters: string[]) => {
  console.log(quarters, 'quarters');
  if (quarters.length === 2 && quarters.includes('Q1') && quarters.includes('Q2')) {
    console.log(quarters.map(quarter => ({key: quarter, alias: QUARTER_ALIAS[quarter as keyof typeof QUARTER_ALIAS]})))
    return quarters.map(quarter => ({key: quarter, alias: QUARTER_ALIAS[quarter as keyof typeof QUARTER_ALIAS]}));
  } else {
    return quarters.map(quarter => ({key: quarter, alias: quarter}));
  }
};

export const isEnabledTwoQuarterMode = (quarters: string[]) => {
  console.log(quarters, 'quarters');
  if (quarters.length === 2 && quarters.includes('Q1') && quarters.includes('Q2')) {
    return true;
  } else {
    return false;
  }
};
