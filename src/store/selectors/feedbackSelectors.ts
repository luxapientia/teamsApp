import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../index';

export const selectFeedbacksByAnnualTargetId = createSelector(
  [
    (state: RootState) => state.feedback.feedbacks,
    (_: RootState, annualTargetId: string) => annualTargetId
  ],
  (feedbacks, annualTargetId) => feedbacks.filter(feedback => feedback.annualTargetId === annualTargetId)
); 