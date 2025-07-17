import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ChildFolder, Folder, FoldersState } from '../types/folder';
import { loadAuthData } from './authSlice';
import { loadBookmarkParentName } from './bookmarkSlice';
import { getChildFolders } from '../../utils/siderUtility/siderUtility';

const initialState: FoldersState = {
  folders: [],
  collectionFolders: [],
  collectionAncestorFolders: [],
  loading: false,
  error: null,
  successMessage: null,
};

const saveFoldersToStorage = (folders: Folder[]) => {
  if (chrome && chrome.storage) {
    chrome.storage.local.set({ allFolders: folders }, () => {});
  }
};

const saveCollectionFoldersToStorage = async (collectionFolders: ChildFolder[]) => {
  if (chrome && chrome.storage) {
    chrome.storage.local.set({ collectionFolders: collectionFolders }, () => {});
  }
}

const loadFoldersFromStorage = async (): Promise<Folder[]> => {
  try {
    if (chrome && chrome.storage) {
      const result = await chrome.storage.local.get('allFolders');
      return result.allFolders || [];
    }
    return [];
  } catch (error) {
    console.error('Error loading folders from storage:', error);
    return [];
  }
};

const loadAncestorFoldersFromStorage = async (): Promise<string[]> => {
  try {
    if (chrome && chrome.storage) {
      const result = await chrome.storage.local.get('collectionFolderAncestors');
      return result.collectionFolderAncestors || [];
    }
    return [];
  } catch (error) {
    console.error('Error loading folders from storage:', error);
    return [];
  }
}

const savedAncestorFoldersToStorage = async (collectionFolderAncestors: string[]) => {  
  if (chrome && chrome.storage) {
    chrome.storage.local.set({ collectionFolderAncestors: collectionFolderAncestors }, () => {});
  }
}

export const createFolder = createAsyncThunk<
  Folder,
  { name: string; parentFolder: string },
  { rejectValue: string }
>('folders/create', async ({ name, parentFolder }, { rejectWithValue }) => {
  const QAPI = process.env.REACT_APP_QAPI_URL;
  const authData = await loadAuthData();
  const url = new URL(`${QAPI}/folders/create-folder`);

  try {
    const req = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authData.token}`,
      },
      body: JSON.stringify({ name, parentFolder }),
    });

    if (req.status !== 201) {
      const errorMessage = req.statusText;
      return rejectWithValue(errorMessage);
    }

    const data = await req.json();
    return data;
  } catch (error) {
    return rejectWithValue('Failed to create folder. Please try again.');
  }
});

export const renameFolder = createAsyncThunk<
  Folder,
  { id: number | null, parentFolder: string | null; name: string | null },
  { rejectValue: string }
>('folders/rename', async ({ id, parentFolder, name }, { rejectWithValue }) => {
  const QAPI = process.env.REACT_APP_QAPI_URL;
  const authData = await loadAuthData();
  const url = new URL(`${QAPI}/folders/${id}`);

  try {
    const req = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authData.token}`,
      },
      body: JSON.stringify({ parentFolder, name }),
    });

    if (req.status !== 200) {
      const errorMessage = req.statusText;
      return rejectWithValue(errorMessage);
    }

    const data = await req.json();
    return data;
  } catch (error) {
    return rejectWithValue('Failed to rename folder. Please try again.');
  }
});

export const deleteFolder = createAsyncThunk<
  void,
  { id: number | null },
  { rejectValue: string }
>('folders/delete', async ({ id }, { rejectWithValue }) => {
  const QAPI = process.env.REACT_APP_QAPI_URL;
  const authData = await loadAuthData();
  const url = new URL(`${QAPI}/folders/${id}`);

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
      const errorMessage = req.statusText || 'Failed to delete folder';
      return rejectWithValue(errorMessage);
    }

    const data = await req.json();
    return data;
  } catch (error) {
    return rejectWithValue('Failed to delete folder. Please try again.');
  }
});

export const fetchAllFolders = createAsyncThunk<
  Folder[],
  void,
  { rejectValue: string }
>('folders/fetchAll', async (_, { rejectWithValue }) => {
  const QAPI = process.env.REACT_APP_QAPI_URL;
  const authData = await loadAuthData(); 
  const url = new URL(`${QAPI}/folders/retrieve-folders`);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authData.token}`,
      },
    });

    if (response.status !== 200) {
      throw new Error('Error retrieving folders');
    }

    const data: Folder[] = await response.json();
    saveFoldersToStorage(data);
    return data;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to fetch folders');
  }
});

export const initializeFolders = () => async (dispatch: any) => {
  const savedFolders = await loadFoldersFromStorage();
  dispatch(setFolders(savedFolders));
};

export const initializeChildFolders = () => async (dispatch: any) => {
  const savedFolders = await loadFoldersFromStorage();
  const savedBookmarkParentName = await loadBookmarkParentName();
  const selectedCollectionFolders = await getChildFolders(
    savedBookmarkParentName,
    savedFolders,
  )
  dispatch(setCollectionFolders(selectedCollectionFolders));
}

export const initializeCollectionAncestorFolders = () => async (dispatch: any) => {
  const savedAncestorFolders = await loadAncestorFoldersFromStorage()
  dispatch(setCollectionAncestorFolders(savedAncestorFolders));
}

const foldersSlice = createSlice({
  name: 'folders',
  initialState,
  reducers: {
    setFolders: (state, action: PayloadAction<Folder[]>) => {
      state.folders = action.payload;
      state.error = null;
    },
    setCollectionFolders: (state, action: PayloadAction<ChildFolder[]>) => {
      state.collectionFolders = action.payload;
      saveCollectionFoldersToStorage(action.payload);
      state.error = null;
    },
    setCollectionAncestorFolders: (state, action: PayloadAction<string[]>) => {
      state.collectionAncestorFolders = action.payload;
      savedAncestorFoldersToStorage(action.payload);
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllFolders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchAllFolders.fulfilled,
        (state, action: PayloadAction<Folder[]>) => {
          state.loading = false;
          state.folders = action.payload;
          state.error = null;
        },
      )
      .addCase(
        fetchAllFolders.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = false;
          state.error = action.payload || 'An unknown error occurred';
        },
      )
      .addCase(createFolder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(
        createFolder.fulfilled,
        (state, action: PayloadAction<Folder>) => {
          state.loading = false;
          state.folders.push(action.payload);
          saveFoldersToStorage(state.folders);
          state.error = null;
          state.successMessage = 'Folder created successfully';
        },
      )
      .addCase(
        createFolder.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = false;
          state.error = action.payload || 'Failed to create folder';
        },
      )
      .addCase(renameFolder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(
        renameFolder.fulfilled,
        (state, action: PayloadAction<Folder>) => {
          state.loading = false;
          state.error = null;
          state.successMessage = 'Folder renamed successfully';
        },
      )
      .addCase(
        renameFolder.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = false;
          state.error = action.payload || 'Failed to rename folder';
        },
      )
      .addCase(deleteFolder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(
        deleteFolder.fulfilled,
        (state, action: PayloadAction<void, string, { arg: { id: number | null } }>) => {
          state.loading = false;
          state.error = null;
          state.successMessage = 'Folder deleted successfully';
          if (action.meta.arg.id !== null) {
            state.folders = state.folders.filter(folder => folder.id !== action.meta.arg.id);
            saveFoldersToStorage(state.folders);
          }
        },
      )
      .addCase(
        deleteFolder.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = false;
          state.error = action.payload || 'Failed to delete folder';
        },
      )
  },
});

export const { setFolders, setCollectionFolders,
  setCollectionAncestorFolders,  clearSuccessMessage } = foldersSlice.actions;
export default foldersSlice.reducer;