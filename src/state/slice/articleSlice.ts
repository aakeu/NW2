import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { loadAuthData } from './authSlice';
import { Article, ArticlesState } from '../types/article';

const initialState: ArticlesState = {
    articles: [],
    loading: false,
    error: null,
};

const saveArticlesToStorage = (allArticles: Article[]) => {
    if (chrome && chrome.storage) {
        const uniqueArticles: Article[] = [];
        const articlesFolderNameSet = new Set();

        Array.isArray(allArticles) &&
            allArticles.length > 0 &&
            allArticles.forEach((article) => {
                if (!articlesFolderNameSet.has(article.articleFolderName)) {
                    uniqueArticles.push(article);
                    articlesFolderNameSet.add(article.articleFolderName);
                }
            });

        allArticles = uniqueArticles;
        chrome.storage.local.set({ allArticles: allArticles }, () => {});
    }
};

const loadArticlesFromStorage = async (): Promise<Article[]> => {
    try {
        if (chrome && chrome.storage) {
            const result = await chrome.storage.local.get('allArticles');
            return result.allArticles || [];
        }
        return [];
    } catch (error) {
        console.error('Error loading articles from storage:', error);
        return [];
    }
};

export const fetchAllArticles = createAsyncThunk<
    Article[],
    void,
    { rejectValue: string }
>('articles/fetchAll', async (_, { rejectWithValue }) => {
    const QAPI = process.env.REACT_APP_QAPI_URL;
    const authData = await loadAuthData();
    const url = new URL(`${QAPI}/user/articles/retrieve-articles`);

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authData.token}`,
            },
        });

        if (response.status !== 200) {
            throw new Error('Error retrieving articles');
        }

        const data: Article[] = await response.json();
        saveArticlesToStorage(data);
        return data;
    } catch (error: any) {
        return rejectWithValue(error.message || 'Failed to fetch articles');
    }
});

export const deleteSelectedArticle = createAsyncThunk<
  void,
  { id: number | null; selectedArticleName: string },
  { rejectValue: string }
>('articles/delete', async ({ id, selectedArticleName }, { rejectWithValue }) => {
  const QAPI = process.env.REACT_APP_QAPI_URL;
  const authData = await loadAuthData();
  const url = new URL(`${QAPI}/user/articles/selectedArticle/${id}`);
  url.searchParams.append('selectedArticleName', selectedArticleName);

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
    return rejectWithValue('Failed to delete article. Please try again.');
  }
});

export const initializeArticles = () => async (dispatch: any) => {
    const savedArticles = await loadArticlesFromStorage();
    dispatch(setArticles(savedArticles));
};

const articlesSlice = createSlice({
    name: 'articles',
    initialState,
    reducers: {
        setArticles: (state, action: PayloadAction<Article[]>) => {
            state.articles = action.payload;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllArticles.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllArticles.fulfilled, (state, action: PayloadAction<Article[]>) => {
                state.loading = false;
                state.articles = action.payload;
                state.error = null;
            })
            .addCase(fetchAllArticles.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.loading = false;
                state.error = action.payload || 'An unknown error occurred';
            })
            .addCase(deleteSelectedArticle.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteSelectedArticle.fulfilled, (state) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(deleteSelectedArticle.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.loading = false;
                state.error = action.payload || 'An unknown error occurred';
            })
    },
});

export const { setArticles } = articlesSlice.actions;
export default articlesSlice.reducer;