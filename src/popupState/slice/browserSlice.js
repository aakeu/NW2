import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  query: '',
  engine: 'Google',
  googlePhaseCache: 1,
  scholarPhaseCache: 1,
  googleStoredQuery: '',
  scholarStoredQuery: '',
  fromExtraction: false
};

const browserSlice = createSlice({
  name: 'browser',
  initialState,
  reducers: {
    setQueryState: (state, action) => {
      state.query = action.payload.query;
    },
    setPhaseCacheState: (state, action) => {
      const { engine, phase } = action.payload;
      if (engine === 'Google') {
        state.googlePhaseCache = phase;
      } else if (engine === 'GoogleScholar') {
        state.scholarPhaseCache = phase;
      }
    },
    setEngineState: (state, action) => {
      state.engine = action.payload;
    },
    setGoogleStoredQuery: (state, action) => {
      state.googleStoredQuery = action.payload.query;
    },
    setScholarStoredQuery: (state, action) => {
      state.scholarStoredQuery = action.payload.query;
    },
    setFromExtraction: (state, action) => {
      state.fromExtraction = action.payload.fromExtraction
    }
  },
});

export const {
  setQueryState,
  setPhaseCacheState,
  setEngineState,
  setGoogleStoredQuery,
  setScholarStoredQuery,
  setFromExtraction
} = browserSlice.actions;

export default browserSlice.reducer;