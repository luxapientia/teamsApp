import { configureStore } from '@reduxjs/toolkit';
import scorecardReducer from './slices/scorecardSlice';
import teamsReducer from './slices/teamsSlice';
import personalPerformanceReducer from './slices/personalPerformanceSlice';
import notificationReducer from './slices/notificationSlice';
export const store = configureStore({
  reducer: {
    scorecard: scorecardReducer,
    teams: teamsReducer,
    personalPerformance: personalPerformanceReducer,
    notification: notificationReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 