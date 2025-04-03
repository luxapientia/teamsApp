import { configureStore } from '@reduxjs/toolkit';
import scorecardReducer from './slices/scorecardSlice';
import teamsReducer from './slices/teamsSlice';
import personalPerformanceReducer from './slices/personalPerformanceSlice';
export const store = configureStore({
  reducer: {
    scorecard: scorecardReducer,
    teams: teamsReducer,
    personalPerformance: personalPerformanceReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 