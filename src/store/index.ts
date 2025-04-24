import { configureStore } from '@reduxjs/toolkit';
import scorecardReducer from './slices/scorecardSlice';
import teamsReducer from './slices/teamsSlice';
import personalPerformanceReducer from './slices/personalPerformanceSlice';
import notificationReducer from './slices/notificationSlice';
import devPlanReducer from './slices/devPlanSlice';
import trainingEmployeesReducer from './slices/trainingEmployeesSlice';
import feedbackReducer from './slices/feedbackSlice';
export const store = configureStore({
  reducer: {
    scorecard: scorecardReducer,
    teams: teamsReducer,
    personalPerformance: personalPerformanceReducer,
    notification: notificationReducer,
    devPlan: devPlanReducer,
    trainingEmployees: trainingEmployeesReducer,
    feedback: feedbackReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 