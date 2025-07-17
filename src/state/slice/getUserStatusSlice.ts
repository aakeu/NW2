import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { loadAuthData } from './authSlice';

interface AuthState {
  token: string | null
  refreshToken: string | null
  tokenExpires: number | null
  user: any
}

interface UserStatusResponse {
  id: number | null
  name: string | null
  email: string | null
  password: string | null
  provider: string | null
  status: string | null
  socialId: string | null
  createdAt: string | null
  hash: null
  updatedAt: string | null
  picture: string | null
  subscriptionState: string | null
  subscriptionType: string | null
  subscriptionDuration: string | null
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  stripePaymentId: string | null
  isSubscribed: boolean
  subscriptionExpiry: string | null
  activationExpiry: string | null
  coin: number | null
  deletedAt: string | null
  previousPassword: string | null
}

interface UserStatusState {
  status: UserStatusResponse | null
  loading: boolean
  error: string | null
}

const initialState: UserStatusState = {
  status: null,
  loading: false,
  error: null,
}

export const fetchUserStatus = createAsyncThunk<
  UserStatusResponse,
  void,
  { rejectValue: string }
>('user/fetchStatus', async (_, { rejectWithValue }) => {
  const QAPI = process.env.REACT_APP_QAPI_URL
  const authData = await loadAuthData();
  const url = new URL(`${QAPI}/auth/status`)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authData.token}`,
      },
    })

    if (response.status !== 200) {
      throw new Error('Error retrieving user status')
    }

    const data = await response.json()
    return data as UserStatusResponse
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to fetch user status')
  }
})

const userStatusSlice = createSlice({
  name: 'userStatus',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(
        fetchUserStatus.fulfilled,
        (state, action: PayloadAction<UserStatusResponse>) => {
          state.loading = false
          state.status = action.payload
          state.error = null
        },
      )
      .addCase(
        fetchUserStatus.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = false
          state.error = action.payload || 'An unknown error occurred'
          state.status = null
        },
      )
  },
})

export default userStatusSlice.reducer
