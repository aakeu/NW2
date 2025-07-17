import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { loadAuthData } from './authSlice';

interface WebSummaryResponse {
  summary: string;
}

interface WebSummaryState {
  summaries: {
    [url: string]: {
      summary: string | null;
      loading: boolean;
      error: string | null;
    };
  };
}

const initialState: WebSummaryState = {
  summaries: {},
};

export const fetchWebSummary = createAsyncThunk<
  { url: string; summary: string },
  string,
  { rejectValue: string }
>('webSummary/fetchWebSummary', async (url: string, { rejectWithValue }) => {
  const origin = process.env.REACT_APP_QAPI_URL;
  const URL = `${origin}/summarize?url=${encodeURIComponent(url)}`;

  try {
    const authData = await loadAuthData();
    const response = await fetch(URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authData.token}`,
      },
    });

    if (response.status !== 200) {
      throw new Error('Error retrieving web summary');
    }

    const data: WebSummaryResponse = await response.json();
    return { url, summary: data.summary };
  } catch (error: any) {
    // console.error(error);
    return rejectWithValue(error.message || 'Please try again');
  }
});

const webSummarySlice = createSlice({
  name: 'webSummary',
  initialState,
  reducers: {
    clearSummary: (state, action: PayloadAction<string>) => {
      delete state.summaries[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWebSummary.pending, (state, action) => {
        state.summaries[action.meta.arg] = {
          summary: null,
          loading: true,
          error: null,
        };
      })
      .addCase(fetchWebSummary.fulfilled, (state, action: PayloadAction<{ url: string; summary: string }>) => {
        state.summaries[action.payload.url] = {
          summary: action.payload.summary,
          loading: false,
          error: null,
        };
      })
      .addCase(fetchWebSummary.rejected, (state, action) => {
        state.summaries[action.meta.arg] = {
          summary: null,
          loading: false,
          error: action.payload || 'An unknown error occurred',
        };
      });
  },
});

export const { clearSummary } = webSummarySlice.actions;
export default webSummarySlice.reducer;