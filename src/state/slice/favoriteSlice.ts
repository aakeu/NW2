import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { loadAuthData } from './authSlice';
import { Favorite, FavoritesState } from '../types/favorite';

const initialState: FavoritesState = {
    favorites: [],
    loading: false,
    error: null,
    successMessage: null,
};

const saveFavoritesToStorage = (allFavorites: Favorite[]) => {
    if (chrome && chrome.storage) {
        const uniqueFavorites: Favorite[] = [];
        const titlesSet = new Set()

        Array.isArray(allFavorites) &&
            allFavorites.length > 0 &&
            allFavorites.forEach((favorite) => {
                if (!titlesSet.has(favorite.title)) {
                    uniqueFavorites.push(favorite);
                    titlesSet.add(favorite);
                }
            });

        allFavorites = uniqueFavorites;
        chrome.storage.local.set({ allFavorites: allFavorites }, () => {});
    }
};

const loadFavoritesFromStorage = async (): Promise<Favorite[]> => {
    try {
        if (chrome && chrome.storage) {
            const result = await chrome.storage.local.get('allFavorites');
            return result.allFavorites || [];
        }
        return [];
    } catch (error) {
        console.error('Error loading favorites from storage:', error);
        return [];
    }
};


export const fetchAllFavorites = createAsyncThunk<
    Favorite[],
    void,
    { rejectValue: string }
>('favorite/fetchAll', async (_, { rejectWithValue }) => {
    const QAPI = process.env.REACT_APP_QAPI_URL;
    const authData = await loadAuthData();
    const url = new URL(`${QAPI}/favorite`);

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authData.token}`,
            },
        });

        if (response.status !== 200) {
            throw new Error('Error retrieving favorites');
        }

        const data: Favorite[] = await response.json();
        saveFavoritesToStorage(data);
        return data;
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to fetch favorites');
    }
});

export const deleteFavorite = createAsyncThunk<
  { id: number },
  { id: number | null },
  { rejectValue: string }
>('favorite/delete', async ({ id }, { rejectWithValue }) => {
  const QAPI = process.env.REACT_APP_QAPI_URL;
  const authData = await loadAuthData();
  const url = new URL(`${QAPI}/favorite/${id}`);

  try {
    const req = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authData.token}`,
      },
    });

    if (req.status !== 200) {
      const errorMessage = req.statusText || 'Failed to delete favorite';
      return rejectWithValue(errorMessage);
    }

    const data = await req.json();
    return data;
  } catch (error) {
    return rejectWithValue('Failed to delete favorite. Please try again.');
  }
});

export const initializeFavorites = () => async (dispatch: any) => {
    const savedFavorites = await loadFavoritesFromStorage();
    dispatch(setFavorites(savedFavorites));
};

const favoritesSlice = createSlice({
    name: 'favorites',
    initialState,
    reducers: {
        setFavorites: (state, action: PayloadAction<Favorite[]>) => {
            state.favorites = action.payload;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllFavorites.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllFavorites.fulfilled, (state, action: PayloadAction<Favorite[]>) => {
                state.loading = false;
                state.favorites = action.payload;
                state.error = null;
            })
            .addCase(fetchAllFavorites.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.loading = false;
                state.error = action.payload || 'An unknown error occurred';
            })
            .addCase(deleteFavorite.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(
            deleteFavorite.fulfilled,
                (state, action: PayloadAction<{ id: number }>) => {
                    state.loading = false;
                    state.error = null;
                    state.successMessage = 'favorite deleted successfully';
                },
            )
            .addCase(deleteFavorite.rejected, (state, action: PayloadAction<string | undefined>) => {
                    state.loading = false;
                    state.error = action.payload || 'Failed to delete favorite';
                },
            )
    },
});

export const { setFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;