import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { loadAuthData } from './authSlice';
import { Image, ImagesState } from '../types/image';

const initialState: ImagesState = {
    images: [],
    loading: false,
    error: null,
};

const saveImagesToStorage = (allImages: Image[]) => {
    if (chrome && chrome.storage) {
        const uniqueImages: Image[] = [];
        const imagesFolderNameSet = new Set();

        Array.isArray(allImages) &&
            allImages.length > 0 &&
            allImages.forEach((image) => {
                if (!imagesFolderNameSet.has(image.imageFolderName)) {
                    uniqueImages.push(image);
                    imagesFolderNameSet.add(image.imageFolderName);
                }
            });

        allImages = uniqueImages;
        chrome.storage.local.set({ allImages: allImages }, () => {});
    }
};

const loadImagesFromStorage = async (): Promise<Image[]> => {
    try {
        if (chrome && chrome.storage) {
            const result = await chrome.storage.local.get('allImages');
            return result.allImages || [];
        }
        return [];
    } catch (error) {
        console.error('Error loading images from storage:', error);
        return [];
    }
};

export const fetchAllImages = createAsyncThunk<
    Image[],
    void,
    { rejectValue: string }
>('images/fetchAll', async (_, { rejectWithValue }) => {
    const QAPI = process.env.REACT_APP_QAPI_URL;
    const authData = await loadAuthData();
    const url = new URL(`${QAPI}/user/images/retrieve-images`);

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authData.token}`,
            },
        });

        if (response.status !== 200) {
            throw new Error('Error retrieving images');
        }

        const data: Image[] = await response.json();
        saveImagesToStorage(data);
        return data;
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to fetch images');
    }
});

export const deleteSelectedImage = createAsyncThunk<
  void,
  { id: number | null; selectedImgName: string },
  { rejectValue: string }
>('images/delete', async ({ id, selectedImgName }, { rejectWithValue }) => {
  const QAPI = process.env.REACT_APP_QAPI_URL;
  const authData = await loadAuthData();
  const url = new URL(`${QAPI}/user/images/selectedImage/${id}`);
  url.searchParams.append('selectedImgName', selectedImgName);

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
    return rejectWithValue('Failed to delete image. Please try again.');
  }
});

export const initializeImages = () => async (dispatch: any) => {
    const savedImages = await loadImagesFromStorage();
    dispatch(setImages(savedImages));
};

const imagesSlice = createSlice({
    name: 'images',
    initialState,
    reducers: {
        setImages: (state, action: PayloadAction<Image[]>) => {
            state.images = action.payload;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllImages.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllImages.fulfilled, (state, action: PayloadAction<Image[]>) => {
                state.loading = false;
                state.images = action.payload;
                state.error = null;
            })
            .addCase(fetchAllImages.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.loading = false;
                state.error = action.payload || 'An unknown error occurred';
            })
            .addCase(deleteSelectedImage.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteSelectedImage.fulfilled, (state) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(deleteSelectedImage.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.loading = false;
                state.error = action.payload || 'An unknown error occurred';
            })
    },
});

export const { setImages } = imagesSlice.actions;
export default imagesSlice.reducer;