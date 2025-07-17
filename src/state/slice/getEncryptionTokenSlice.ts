import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { loadAuthData } from './authSlice';

interface AuthState {
  token: string | null
  refreshToken: string | null
  tokenExpires: number | null
  user: any
}

interface EncryptionTokenState {
  token: string | null
  loading: boolean
  error: string | null
}

const initialState: EncryptionTokenState = {
  token: null,
  loading: false,
  error: null,
}

export const syncFetchEncryptToken = async () => {
  const origin = process.env.REACT_APP_QAPI_URL
  const URL = `${origin}/auth/encrypt-token`

  try {
    const authData = await loadAuthData();
    const response = await fetch(URL, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authData.token}`,
      },
    })

    if (response.status !== 200) {
      throw new Error('Error retrieving tracking')
    }

    const data = await response.text()
    return data
  } catch (error: any) {
    console.error(error)
    return ''
  }
}

export const fetchEncryptionToken = createAsyncThunk<
  string,
  void,
  { rejectValue: string }
>('tracking/fetchTracking', async (_, { rejectWithValue }) => {
  const origin = process.env.REACT_APP_QAPI_URL
  const URL = `${origin}/auth/encrypt-token`

  try {
    const authData = await loadAuthData();
    const response = await fetch(URL, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authData.token}`,
      },
    })

    if (response.status !== 200) {
      throw new Error('Error retrieving tracking')
    }

    const data = await response.text()
    return data
  } catch (error: any) {
    console.error(error)
    return rejectWithValue(error.message || 'Please try again')
  }
})

const encryptionTokenSlice = createSlice({
  name: 'encryptionToken',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEncryptionToken.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(
        fetchEncryptionToken.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = false
          state.error = null
          state.token = action.payload
        },
      )
      .addCase(
        fetchEncryptionToken.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = false
          state.error = action.payload || 'An unknown error occurred'
        },
      )
  },
})

export default encryptionTokenSlice.reducer
