import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { loadAuthData } from './authSlice';
import { Video, VideosState } from '../types/video';

const initialState: VideosState = {
    videos: [],
    loading: false,
    error: null,
};

const saveVideosToStorage = (allVideos: Video[]) => {
    if (chrome && chrome.storage) {
        const uniqueVideos: Video[] = [];
        const videosFolderNameSet = new Set();

        Array.isArray(allVideos) &&
            allVideos.length > 0 &&
            allVideos.forEach((video) => {
                if (!videosFolderNameSet.has(video.videoFolderName)) {
                    uniqueVideos.push(video);
                    videosFolderNameSet.add(video.videoFolderName);
                }
            });

        allVideos = uniqueVideos;
        chrome.storage.local.set({ allVideos: allVideos }, () => {});
    }
};

const loadVideosFromStorage = async (): Promise<Video[]> => {
    try {
        if (chrome && chrome.storage) {
            const result = await chrome.storage.local.get('allVideos');
            return result.allVideos || [];
        }
        return [];
    } catch (error) {
        console.error('Error loading videos from storage:', error);
        return [];
    }
};

export const fetchAllVideos = createAsyncThunk<
    Video[],
    void,
    { rejectValue: string }
>('videos/fetchAll', async (_, { rejectWithValue }) => {
    const QAPI = process.env.REACT_APP_QAPI_URL;
    const authData = await loadAuthData();
    const url = new URL(`${QAPI}/user/videos/retrieve-videos`);

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authData.token}`,
            },
        });

        if (response.status !== 200) {
            throw new Error('Error retrieving videos');
        }

        const data: Video[] = await response.json();
        saveVideosToStorage(data);
        return data;
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to fetch videos');
    }
});

export const deleteSelectedVideo = createAsyncThunk<
  void,
  { id: number | null; selectedVideoName: string },
  { rejectValue: string }
>('videos/delete', async ({ id, selectedVideoName }, { rejectWithValue }) => {
  const QAPI = process.env.REACT_APP_QAPI_URL;
  const authData = await loadAuthData();
  const url = new URL(`${QAPI}/user/videos/selectedVideo/${id}`);
  url.searchParams.append('selectedVideoName', selectedVideoName);

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
  } catch (error) {
    return rejectWithValue('Failed to delete video. Please try again.');
  }
});

export const initializeVideos = () => async (dispatch: any) => {
    const savedVideos = await loadVideosFromStorage();
    dispatch(setVideos(savedVideos));
};

const videosSlice = createSlice({
    name: 'videos',
    initialState,
    reducers: {
        setVideos: (state, action: PayloadAction<Video[]>) => {
            state.videos = action.payload;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllVideos.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllVideos.fulfilled, (state, action: PayloadAction<Video[]>) => {
                state.loading = false;
                state.videos = action.payload;
                state.error = null;
            })
            .addCase(fetchAllVideos.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.loading = false;
                state.error = action.payload || 'An unknown error occurred';
            })
            .addCase(deleteSelectedVideo.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteSelectedVideo.fulfilled, (state) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(deleteSelectedVideo.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.loading = false;
                state.error = action.payload || 'An unknown error occurred';
            })
    },
});

export const { setVideos } = videosSlice.actions;
export default videosSlice.reducer;