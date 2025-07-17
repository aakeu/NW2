import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppDispatch } from '..'

interface OpenInNewTabState {
  openInNewTab: boolean
}

const initialState: OpenInNewTabState = {
  openInNewTab: false,
}

const saveOpenInNewTabToStorage = (openInNewTab: boolean) => {
  if (chrome && chrome.storage) {
    chrome.storage.local.set({ openInNewTab: openInNewTab }, () => {
    })
  }
}

const loadOpenInNewTabFromStorage = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (chrome && chrome.storage) {
      chrome.storage.local.get(['openInNewTab'], (result) => {
        resolve((result.openInNewTab as boolean) || false)
      })
    } else {
      resolve(false)
    }
  })
}

const openInNewTabSlice = createSlice({
  name: 'openInNewTab',
  initialState,
  reducers: {
    toggleOpenInNewTab: (state, action: PayloadAction<boolean>) => {
      state.openInNewTab = action.payload
      saveOpenInNewTabToStorage(action.payload)
    },
  },
})

export const { toggleOpenInNewTab } = openInNewTabSlice.actions

export const initializeOpenNewTab = () => async (dispatch: AppDispatch) => {
  const savedOpenInNewTab = await loadOpenInNewTabFromStorage()
  dispatch(toggleOpenInNewTab(savedOpenInNewTab))
}

export default openInNewTabSlice.reducer
