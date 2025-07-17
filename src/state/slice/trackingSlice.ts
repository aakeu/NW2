import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { loadAuthData } from './authSlice';

interface AuthState {
  token: string | null
  refreshToken: string | null
  tokenExpires: number | null
  user: any
}

interface TrackingResponse {
  id: number
  numberOfSearches: number
  numberOfBookmarks: number
  numberOfFolders: number
  numberOfUploads: number
  numberOfLinks: number
  noOfTimesIncognitoIsUsed: number
  noOfTimesChatGptIsUsed: number
  noOfTimesTranslatorIsUsed: number
  noOfTimesOCRIsUsed: number
  createdAt: string
  updatedAt: string
}

export interface TrackingState {
  tracking: TrackingResponse | null
  loading: boolean
  error: string | null
}

const initialState: TrackingState = {
  tracking: null,
  loading: false,
  error: null,
}

export const fetchTracking = createAsyncThunk<
  TrackingResponse,
  void,
  { rejectValue: string }
>('tracking/fetchTracking', async (_, { rejectWithValue }) => {
  const origin = process.env.REACT_APP_QAPI_URL
  const URL = `${origin}/tracking`

  try {
    const authData = await loadAuthData(); 
    const response = await fetch(URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authData.token}`,
      },
    })

    if (response.status !== 200) {
      throw new Error('Error retrieving tracking')
    }

    const data: TrackingResponse = await response.json()
    return data
  } catch (error: any) {
    console.error(error)
    return rejectWithValue(error.message || 'Please try again')
  }
})

const trackingSlice = createSlice({
  name: 'tracking',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTracking.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(
        fetchTracking.fulfilled,
        (state, action: PayloadAction<TrackingResponse>) => {
          state.loading = false
          state.tracking = action.payload
          state.error = null
        },
      )
      .addCase(
        fetchTracking.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = false
          state.error = action.payload || 'An unknown error occurred'
          state.tracking = null
        },
      )
  },
})

export default trackingSlice.reducer
