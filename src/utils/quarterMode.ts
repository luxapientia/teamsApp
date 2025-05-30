import { QUARTER_ALIAS } from "../constants/quarterAlias";
const defaultQuarters = ['Q1', 'Q2', 'Q3', 'Q4'];

export const enableTwoQuarterMode = (quarters: string[], hasRole: boolean) => {
  if (hasRole) {
    return defaultQuarters.map(quarter => ({ key: quarter, alias: quarter }));
  } else if (quarters.length === 2 && quarters.includes('Q1') && quarters.includes('Q2')) {
    return quarters.map(quarter => ({ key: quarter, alias: QUARTER_ALIAS[quarter as keyof typeof QUARTER_ALIAS] }));
  } else {
    return quarters.map(quarter => ({ key: quarter, alias: quarter }));
  }
};

export const isEnabledTwoQuarterMode = (quarters: string[], hasRole: boolean) => {
  if (hasRole) {
    return false;
  } else if (quarters.length === 2 && quarters.includes('Q1') && quarters.includes('Q2')) {
    return true;
  } else {
    return false;
  }
};
