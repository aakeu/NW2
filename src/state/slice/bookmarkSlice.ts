import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { loadAuthData } from './authSlice';
import { Bookmark, BookmarkMinimal, BookmarksState, ChildBookmarks } from '../types/bookmark';
import { addBookmarksIfNotExist } from '../../components/reusables/Reusables';
import { getChildBookmarks } from '../../utils/siderUtility/siderUtility';

const initialState: BookmarksState = {
    bookmarks: [],
    bookmark: {
        id: null,
        date: null,
        imgUrl: '',
        snippet: '',
        title: '',
        url: '',
        source: '',
        folderName: '',
        description: null,
        from: null,
        deleteDate: null,
        user: {
            id: null
        }
    },
    bookmarkParentName: '',
    collectionBookmarks: [],
    loading: false,
    error: null,
    successMessage: null,
};

const saveBookmarksToStorage = async (allBookmarks: Bookmark[]) => {
  if (chrome && chrome.storage) {
    const uniqueBookmarks: Bookmark[] = []
    const titlesSet = new Set()
    
    Array.isArray(allBookmarks) &&
    allBookmarks.length > 0 &&
    allBookmarks.forEach((bookmark) => {
      if (!titlesSet.has(bookmark.title)) {
        uniqueBookmarks.push(bookmark)
        titlesSet.add(bookmark.title)
      }
    })

    allBookmarks = uniqueBookmarks
    chrome.storage.local.set({ allBookmarks: allBookmarks }, () => {});
    await addBookmarksIfNotExist(allBookmarks)
  }
};

const saveCollectionBookmarksToStorage = async (collectionBookmarks: ChildBookmarks[]) => {
  if (chrome && chrome.storage) {
    chrome.storage.local.set({ collectionBookmarks: collectionBookmarks }, () => {});
  }
}

const loadBookmarksFromStorage = async (): Promise<Bookmark[]> => {
  try {
    if (chrome && chrome.storage) {
      const result = await chrome.storage.local.get('allBookmarks');
      return result.allBookmarks || [];
    }
    return [];
  } catch (error) {
    console.error('Error loading bookmarks from storage:', error);
    return [];
  }
};

export const loadBookmarkParentName = async (): Promise<string> => {
  try {
    if (chrome && chrome.storage) {
      const result = await chrome.storage.local.get('selectedBookmarkParentName');
      return result.selectedBookmarkParentName || '';
    }
    return "";
  } catch (error) {
    console.error('Error loading bookmark parent name from storage:', error);
    return "";
  }
}

export const savedBookmarkParentNameToStorage = async (selectedBookmarkParentName: string) => {
  if (chrome && chrome.storage) {
    chrome.storage.local.set({ selectedBookmarkParentName }, () => {});
  }
 }

export const createBookmark = createAsyncThunk<
BookmarkMinimal,
  {  imgUrl: string | null,
    snippet: string | null,
    title: string,
    url: string,
    source: string,
    folderName: string,
    description: string | null, },
  { rejectValue: string }
>('bookmarks/create', async ({ imgUrl,
    snippet,
    title,
    url,
    source,
    folderName,
    description }, { rejectWithValue }) => {
  const QAPI = process.env.REACT_APP_QAPI_URL;
  const authData = await loadAuthData();
  const urlAddress = new URL(`${QAPI}/bookmarks/create-bookmark`);

  try {
    const req = await fetch(urlAddress, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authData.token}`,
      },
        body: JSON.stringify({
            imgUrl,
            snippet,
            title,
            url,
            source,
            folderName,
            description 
        }),
    });

    if (req.status === 409) {
      const errorMessage = "Bookmark already exists"
      return rejectWithValue(errorMessage);
    }

    if (req.status !== 201) {
      const errorMessage = req.statusText;
      return rejectWithValue(errorMessage);
    }

    const data = await req.json();
    return data;
  } catch (error) {
    return rejectWithValue('Failed to create bookmark. Please try again.');
  }
});

export const fetchAllBookmarks = createAsyncThunk<
  Bookmark[],
  void,
  { rejectValue: string }
>('bookmarks/fetchAll', async (_, { rejectWithValue }) => {
  const QAPI = process.env.REACT_APP_QAPI_URL;
  const authData = await loadAuthData(); 
  const url = new URL(`${QAPI}/bookmarks/retrieve-bookmarks`);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authData.token}`,
      },
    });

    if (response.status !== 200) {
      throw new Error('Error retrieving bookmarks');
    }

    const data: Bookmark[] = await response.json();
    saveBookmarksToStorage(data);
    return data;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to fetch bookmarks');
  }
});

export const deleteBookmark = createAsyncThunk<
  void,
  { id: number | null },
  { rejectValue: string }
>('bookmarks/delete', async ({ id }, { rejectWithValue }) => {
  const QAPI = process.env.REACT_APP_QAPI_URL;
  const authData = await loadAuthData();
  const url = new URL(`${QAPI}/bookmarks/${id}`);

  try {
    const req = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authData.token}`,
      },
    });

    if (req.status === 204) {
      return;
    }

    if (req.status !== 200) {
      const errorMessage = req.statusText || 'Failed to delete bookmark';
      return rejectWithValue(errorMessage);
    }

    const data = await req.json();
    return data;
  } catch (error) {
    return rejectWithValue('Failed to delete bookmark. Please try again.');
  }
});

export const initializeBookmarks = () => async (dispatch: any) => {
  const savedBookmarks = await loadBookmarksFromStorage();
  dispatch(setBookmarks(savedBookmarks));
};

export const initializeBookmarkParentName = () => async (dispatch: any) => {
  const savedBookmarkParentName = await loadBookmarkParentName();
  dispatch(setBookmarkParentName(savedBookmarkParentName));
};

export const initializeChildBookmarks = () => async (dispatch: any) => {
  const savedBookmarks = await loadBookmarksFromStorage();
  const savedBookmarkParentName = await loadBookmarkParentName();
  const selectedCollectionBookmarks = await getChildBookmarks(
    savedBookmarkParentName,
    savedBookmarks,
  )
  dispatch(setCollectionBookmarks(selectedCollectionBookmarks));
}

const bookmarksSlice = createSlice({
  name: 'bookmarks',
  initialState,
  reducers: {
    setBookmarks: (state, action: PayloadAction<Bookmark[]>) => {
      state.bookmarks = action.payload;
      state.error = null;
    },
    setBookmarkParentName: (state, action: PayloadAction<string>) => {
      state.bookmarkParentName = action.payload;
      savedBookmarkParentNameToStorage(action.payload)
    },
    setCollectionBookmarks: (state, action: PayloadAction<ChildBookmarks[]>) => {
      state.collectionBookmarks = action.payload;
      saveCollectionBookmarksToStorage(action.payload);
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllBookmarks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchAllBookmarks.fulfilled,
        (state, action: PayloadAction<Bookmark[]>) => {
          state.loading = false;
          state.bookmarks = action.payload;
          state.error = null;
        },
      )
      .addCase(
        fetchAllBookmarks.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = false;
          state.error = action.payload || 'An unknown error occurred';
        },
      )
      .addCase(createBookmark.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(
        createBookmark.fulfilled,
        (state, action: PayloadAction<BookmarkMinimal>) => {
          state.loading = false;
          state.bookmark = action.payload
          state.error = null;
          state.successMessage = 'Bookmark created successfully';
        },
      )
      .addCase(
        createBookmark.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = false;
          state.error = action.payload || 'Failed to create bookmark';
        },
      )
      .addCase(deleteBookmark.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(
        deleteBookmark.fulfilled,
        (state, action: PayloadAction<void>) => {
          state.loading = false;
          state.error = null;
          state.successMessage = 'Bookmark deleted successfully';
        },
      )
      .addCase(
        deleteBookmark.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = false;
          state.error = action.payload || 'Failed to delete bookmark';
        },
      )
  },
});

export const { setBookmarks, setBookmarkParentName,
  setCollectionBookmarks, clearSuccessMessage } = bookmarksSlice.actions;
export default bookmarksSlice.reducer;