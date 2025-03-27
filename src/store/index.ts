import { configureStore } from '@reduxjs/toolkit';
import scorecardReducer from './slices/scorecardSlice';

export const store = configureStore({
  reducer: {
    scorecard: scorecardReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 