import { createSelector } from 'reselect';
import { RootState } from '../index';

const getSummaries = (state: RootState) => state.webSummary.summaries;

const getUrl = (_state: RootState, url: string) => url;

export const selectWebSummaryState = createSelector(
  [getSummaries, getUrl],
  (summaries, url) => {
    return (
      summaries[url] || {
        summary: null,
        loading: false,
        error: null,
      }
    );
  },
);