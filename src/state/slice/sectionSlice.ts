import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppDispatch } from '..'

type SectionType =
  | 'welcomeSection'
  | 'homeSection'
  | 'tabSection'
  | 'allTabsSection'
  | 'ocrSection'
  | 'translateSection'
  | 'profileSection'
  | 'chatSection'
  | 'dashboardSection'
  | 'dashboardCollectionSection'
  | 'dashboardFavoritesSection'
  | 'dashboardLinksSection'
  | 'dashboardImagesSection'
  | 'dashboardVideosSection'
  | 'dashboardArticlesSection'
  | 'dashboardMeetingsSection'

interface SectionState {
  activeSection: SectionType
}

const initialState: SectionState = {
  activeSection: 'welcomeSection',
}

const saveSectionToStorage = (section: SectionType) => {
  if (chrome && chrome.storage) {
    chrome.storage.local.set({ activeSection: section }, () => {
      // console.log(`Section saved: ${section}`)
    })
  }
}

const loadSectionFromStorage = (): Promise<SectionType> => {
  return new Promise((resolve) => {
    if (chrome && chrome.storage) {
      chrome.storage.local.get(['activeSection'], (result) => {
        resolve((result.activeSection as SectionType) || 'welcomeSection')
      })
    } else {
      resolve('welcomeSection')
    }
  })
}

const sectionSlice = createSlice({
  name: 'sections',
  initialState,
  reducers: {
    setActiveSection: (state, action: PayloadAction<SectionType>) => {
      state.activeSection = action.payload
      saveSectionToStorage(action.payload)
    },
  },
})

export const { setActiveSection } = sectionSlice.actions

export const initializeSection = () => async (dispatch: AppDispatch) => {
  const savedSection = await loadSectionFromStorage()
  dispatch(setActiveSection(savedSection))
}

export default sectionSlice.reducer
