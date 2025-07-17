import { configureStore } from '@reduxjs/toolkit'
import sectionReducer from './slice/sectionSlice'
import themeReducer from './slice/themeSlice'
import openInNewTabReducer from './slice/openInNewTabSlice'
import searchEngineOptionReducer from './slice/searchEngineOptionSlice'
import loginTypeReducer from './slice/loginModalSlice'
import authReducer from './slice/authSlice'
import searchReducer from './slice/searchSlice'
import webSummaryReducer from './slice/webSummarySlice'
import trackingReducer from './slice/trackingSlice'
import reusableReducer from './slice/reusableStatesSlice'
import encryptionTokenReducer from './slice/getEncryptionTokenSlice'
import userStatusReducer from './slice/getUserStatusSlice'
import foldersReducer from './slice/folderSlice'
import bookmarksReducer from './slice/bookmarkSlice'
import imagesReducer from './slice/imageSlice'
import videosReducer from './slice/videoSlice'
import articlesReducer from './slice/articleSlice'
import favoritesReducer from './slice/favoriteSlice'
import gptReducer from './slice/gpt/gptSlice'
import translateReducer from './slice/translateSlice'
import cardListReducer from './slice/cardListSlice'
import statusReducer from './slice/statusSlice'

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    sections: sectionReducer,
    openInNewTab: openInNewTabReducer,
    searchEngineOption: searchEngineOptionReducer,
    loginType: loginTypeReducer,
    auth: authReducer,
    search: searchReducer,
    webSummary: webSummaryReducer,
    tracking: trackingReducer,
    reusable: reusableReducer,
    encryptionToken: encryptionTokenReducer,
    userStatus: userStatusReducer,
    folders: foldersReducer,
    bookmarks: bookmarksReducer,
    images: imagesReducer,
    videos: videosReducer,
    articles: articlesReducer,
    favorites: favoritesReducer,
    gpt: gptReducer,
    translate: translateReducer,
    cardLIst: cardListReducer,
    status: statusReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
