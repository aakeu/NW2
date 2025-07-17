import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { google_scholar, google_search } from './api/searchApi';
import { AppDispatch, RootState } from '../index';
import { GoogleScholarSearchResult, GoogleSearchResult } from '../types/search';

interface CachedSearchData {
  results: GoogleSearchResult[] | GoogleScholarSearchResult[];
  timestamp: number;
}

interface SearchState {
  searchContainer: {
    Google: {
      [query: string]: {
        [page: number]: GoogleSearchResult[];
      };
    };
    GoogleScholar: {
      [query: string]: {
        [page: number]: GoogleScholarSearchResult[];
      };
    };
  };
  queries: {
    Google: string | null;
    GoogleScholar: string | null;
  };
  currentPage: number;
  loading: boolean;
  error: string | null;
}

const initialState: SearchState = {
  searchContainer: {
    Google: {},
    GoogleScholar: {},
  },
  queries: {
    Google: null,
    GoogleScholar: null,
  },
  currentPage: 1,
  loading: false,
  error: null,
};

const storageKey = 'searchCache';
const TTL = 24 * 60 * 60 * 1000;

const loadFromStorage = (): Promise<{
  searchContainer: SearchState['searchContainer'];
  queries: SearchState['queries'];
  currentPage: number;
}> => {
  return new Promise((resolve) => {
    chrome.storage.local.get([storageKey], (result) => {
      const cached = result[storageKey] || {
        searchContainer: { Google: {}, GoogleScholar: {} },
        queries: { Google: null, GoogleScholar: null },
        currentPage: 1,
      };
      const now = Date.now();
      ['Google', 'GoogleScholar'].forEach((engine) => {
        Object.keys(cached.searchContainer[engine]).forEach((query) => {
          Object.keys(cached.searchContainer[engine][query]).forEach((page) => {
            const data: CachedSearchData =
              cached.searchContainer[engine][query][page];
            if (now - data.timestamp > TTL) {
              delete cached.searchContainer[engine][query][page];
            }
          });
          if (Object.keys(cached.searchContainer[engine][query]).length === 0) {
            delete cached.searchContainer[engine][query];
          }
        });
      });
      resolve({
        searchContainer: {
          Google: cached.searchContainer.Google || {},
          GoogleScholar: cached.searchContainer.GoogleScholar || {},
        },
        queries: {
          Google: cached.queries?.Google || null,
          GoogleScholar: cached.queries?.GoogleScholar || null,
        },
        currentPage: cached.currentPage || 1,
      });
    });
  });
};

const saveToStorage = (
  searchContainer: SearchState['searchContainer'],
  queries: SearchState['queries'],
  currentPage: number,
) => {
  chrome.storage.local.set({
    [storageKey]: { searchContainer, queries, currentPage },
  });
};

export const fetchGoogleSearch = createAsyncThunk(
  'search/fetchGoogleSearch',
  async (
    { query, phase }: { query: string; phase: number },
    { getState, rejectWithValue },
  ) => {
    const state = getState() as RootState;
    let cachedResults = state.search.searchContainer.Google[query]?.[phase];

    if (!cachedResults) {
      const cachedData = await loadFromStorage();
      cachedResults = cachedData.searchContainer.Google[query]?.[phase];
      if (cachedResults) {
        return { query, phase, results: cachedResults, fromCache: true };
      }
    }

    try {
      const results = await google_search(query, phase);
      return { query, phase, results, fromCache: false };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
);

export const fetchGoogleScholarSearch = createAsyncThunk(
  'search/fetchGoogleScholarSearch',
  async (
    { query, phase }: { query: string; phase: number },
    { getState, rejectWithValue },
  ) => {
    const state = getState() as RootState;
    let cachedResults = state.search.searchContainer.GoogleScholar[query]?.[phase];

    if (!cachedResults) {
      const cachedData = await loadFromStorage();
      cachedResults = cachedData.searchContainer.GoogleScholar[query]?.[phase];
      if (cachedResults) {
        return { query, phase, results: cachedResults, fromCache: true };
      }
    }

    try {
      const results = await google_scholar(query, phase);
      return { query, phase, results, fromCache: false };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
);

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setQuery: (
      state,
      action: PayloadAction<{ query: string; engine: 'Google' | 'GoogleScholar' }>,
    ) => {
      state.queries[action.payload.engine] = action.payload.query;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    clearSearch: (state) => {
      state.searchContainer.Google = {};
      state.searchContainer.GoogleScholar = {};
      state.queries.Google = null;
      state.queries.GoogleScholar = null;
      state.currentPage = 1;
      state.error = null;
      chrome.storage.local.remove(storageKey);
    },
    loadCachedData: (
      state,
      action: PayloadAction<{
        searchContainer: SearchState['searchContainer'];
        queries: SearchState['queries'];
        currentPage: number;
      }>,
    ) => {
      state.searchContainer = action.payload.searchContainer;
      state.queries = action.payload.queries;
      state.currentPage = action.payload.currentPage;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGoogleSearch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchGoogleSearch.fulfilled,
        (
          state,
          action: PayloadAction<{
            query: string;
            phase: number;
            results: GoogleSearchResult[];
            fromCache: boolean;
          }>,
        ) => {
          const { query, phase, results, fromCache } = action.payload;
          if (!state.searchContainer.Google[query]) {
            state.searchContainer.Google[query] = {};
          }
          state.searchContainer.Google[query][phase] = results;
          state.loading = false;
          state.queries.Google = query;
          state.currentPage = phase;
          if (!fromCache) {
            const cachedData: CachedSearchData = {
              results: results.slice(0, 5),
              timestamp: Date.now(),
            };
            const updatedStorage = { ...state.searchContainer };
            updatedStorage.Google[query][phase] =
              cachedData.results as GoogleSearchResult[];
            saveToStorage(updatedStorage, state.queries, phase);
          }
        },
      )
      .addCase(fetchGoogleSearch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchGoogleScholarSearch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchGoogleScholarSearch.fulfilled,
        (
          state,
          action: PayloadAction<{
            query: string;
            phase: number;
            results: GoogleScholarSearchResult[];
            fromCache: boolean;
          }>,
        ) => {
          const { query, phase, results, fromCache } = action.payload;
          if (!state.searchContainer.GoogleScholar[query]) {
            state.searchContainer.GoogleScholar[query] = {};
          }
          state.searchContainer.GoogleScholar[query][phase] = results;
          state.loading = false;
          state.queries.GoogleScholar = query;
          state.currentPage = phase;
          if (!fromCache) {
            const cachedData: CachedSearchData = {
              results: results.slice(0, 5),
              timestamp: Date.now(),
            };
            const updatedStorage = { ...state.searchContainer };
            updatedStorage.GoogleScholar[query][phase] =
              cachedData.results as GoogleScholarSearchResult[];
            saveToStorage(updatedStorage, state.queries, phase);
          }
        },
      )
      .addCase(fetchGoogleScholarSearch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setQuery, setPage, clearSearch, loadCachedData } = searchSlice.actions;
export default searchSlice.reducer;

export const initializeSearchState = () => async (dispatch: AppDispatch) => {
  const cachedData = await loadFromStorage();
  dispatch(loadCachedData(cachedData));
};