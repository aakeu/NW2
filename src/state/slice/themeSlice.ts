import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppDispatch } from '..'

interface ThemeState {
  isDarkMode: boolean
}

const initialState: ThemeState = {
  isDarkMode: false,
}

const saveThemeToStorage = (theme: boolean) => {
  if (chrome && chrome.storage) {
    chrome.storage.local.set({ theme: theme }, () => {})
  }
}
const loadThemeFromStorage = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (chrome && chrome.storage) {
      chrome.storage.local.get(['theme'], (result) => {
        resolve((result.theme as boolean) || false)
      })
    } else {
      resolve(false)
    }
  })
}

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload
      saveThemeToStorage(action.payload)
    },
  },
})

export const { toggleTheme } = themeSlice.actions

export const initializeTheme = () => async (dispatch: AppDispatch) => {
  const savedTheme = await loadThemeFromStorage()
  dispatch(toggleTheme(savedTheme))
}
export default themeSlice.reducer
