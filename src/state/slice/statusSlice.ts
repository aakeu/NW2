import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { loadAuthData } from './authSlice';

interface StatusState {
    status: string | null;
    loading: boolean;
    error: string | null;
}

const initialState: StatusState = {
    status: null,
    loading: false,
    error: null,
}

export const fetchStatus = createAsyncThunk<
    string | null, 
    void,
    { rejectValue: string }
>('status/fetchStatus', async (_, { rejectWithValue }) => {
    const QAPI = process.env.REACT_APP_QAPI_URL;
    const authData = await loadAuthData();
    const url = new URL(`${QAPI}/auth/status`);

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authData.token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch status');
        }

        const data = await response.json();
        return data.status;

    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to fetch status');
    }
})

const statusSlice = createSlice({
    name: 'status',
    initialState,
    reducers: {
        setStatus: (state, action: PayloadAction<string | null>) => {
            state.status = action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.status = action.payload;
            })
            .addCase(fetchStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch status';
            });
    },
});

export const { setStatus, setLoading, setError } = statusSlice.actions;
export default statusSlice.reducer;