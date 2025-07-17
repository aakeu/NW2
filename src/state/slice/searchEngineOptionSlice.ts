import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppDispatch } from '..'

export type SearchEngineOptionType = 'Google' | 'GoogleScholar'

interface SearchEngineOptionState {
  searchEngine: SearchEngineOptionType
}

const initialState: SearchEngineOptionState = {
  searchEngine: 'Google',
}

const saveSearchEngineOptionToStorage = (
  searchEngine: SearchEngineOptionType,
) => {
  if (chrome && chrome.storage) {
    chrome.storage.local.set({ searchEngine: searchEngine }, () => {})
  }
}

const loadSearchEngineOptionFromStorage =
  (): Promise<SearchEngineOptionType> => {
    return new Promise((resolve) => {
      if (chrome && chrome.storage) {
        chrome.storage.local.get(['searchEngine'], (result) => {
          resolve((result.searchEngine as SearchEngineOptionType) || 'Google')
        })
      } else {
        resolve('Google')
      }
    })
  }

const searchEngineOptionSlice = createSlice({
  name: 'searchEngineOption',
  initialState,
  reducers: {
    setActiveSearchEngineOption: (
      state,
      action: PayloadAction<SearchEngineOptionType>,
    ) => {
      state.searchEngine = action.payload
      saveSearchEngineOptionToStorage(action.payload)
    },
  },
})

export const { setActiveSearchEngineOption } = searchEngineOptionSlice.actions

export const initializeSearchEngineOption =
  () => async (dispatch: AppDispatch) => {
    const savedSearchEngineOption = await loadSearchEngineOptionFromStorage()
    dispatch(setActiveSearchEngineOption(savedSearchEngineOption))
  }

export default searchEngineOptionSlice.reducer
