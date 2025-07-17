import React, { createContext, useContext, useState, useEffect } from 'react'
import { getSecureToken, setSecureToken } from '../api/auth.ts'
import { get_all_folders } from '../api/folder.js'
import {
  getChromeStorage,
  removeChromeStorage,
  setChromeStorage,
} from './utility.tsx'
import {
  filteredArticlesData,
  filteredBookmarksData,
  filteredFavoritesData,
  filteredImagesData,
  filteredVideosData,
} from './filteredData.js'
import { backToHomeSection } from './sectionManagement.js'
import { get_user_status } from '../api/users.ts'
import { getGptHistory } from '../api/store_gpt_result.ts'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const loadAuthData = async () => {
      const storedToken = await getSecureToken('token')
      const storedUser = await getSecureToken('user')
      if (storedToken && storedUser) {
        setToken(storedToken)
        setUser(
          typeof storedUser === 'string' ? JSON.parse(storedUser) : storedUser,
        )
      }
    }
    loadAuthData()
  }, [])

  const login = async ({ token, refreshToken, tokenExpires, user }) => {
    await setSecureToken('token', token)
    await setSecureToken('refreshToken', refreshToken)
    await setSecureToken('tokenExpires', tokenExpires)
    await setSecureToken('user', JSON.stringify(user))
    const allFolders = await get_all_folders()
    // console.log("allFolders", allFolders)

    const existingGptResults = (await getChromeStorage('gptStoredResult')) || {
      allGptHistory: { today: [], p7days: [], pmonth: [], old: [] },
      allGptResults: [],
      activeChatId: null,
    }
    const gptHistoryData = await getGptHistory()
    const updatedResults = {
      ...existingGptResults,
      allGptHistory: gptHistoryData,
    }
    await setChromeStorage({ gptStoredResult: updatedResults })

    if (allFolders) {
      await setChromeStorage({ allFolders })
    }
    setToken(token)
    setUser(user)

    if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({
        type: 'USER_LOGGED_IN',
        payload: { token, user },
      })
    }
  }

  const fetchAllFolders = async () => {
    const allFolders = await get_all_folders()
    if (allFolders) {
      await setChromeStorage({ allFolders })
    }
    if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({
        type: 'FOLDERS_FETCHED',
      })
    }
  }

  const getUserStatus = async () => {
    const userStatus = await get_user_status()
    if (userStatus) {
      await setSecureToken('user', JSON.stringify(userStatus))
    }
    if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({
        type: 'USER_STATUS_FETCHED',
      })
    }
  }

  const fetchDetailsAssociatedWithBookmarks = async () => {
    await filteredBookmarksData()
    await filteredImagesData()
    await filteredVideosData()
    await filteredArticlesData()
    await filteredFavoritesData()

    if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({
        type: 'BOOKMARK_DETAILS_FETCHED',
      })
    }
    await fetchAllFolders()
  }

  const logout = async () => {
    await setSecureToken('token', null)
    await setSecureToken('refreshToken', null)
    await setSecureToken('tokenExpires', null)
    await setSecureToken('user', null)

    await removeChromeStorage('allFolders')
    await removeChromeStorage('allBookmarks')
    await removeChromeStorage('allImages')
    await removeChromeStorage('allVideos')
    await removeChromeStorage('allArticles')
    await removeChromeStorage('tabsToAdd')
    await removeChromeStorage('allTabsSelectedText')

    await removeChromeStorage('gptStoredResult')
    await removeChromeStorage('selectedBookmarkParentName')

    await backToHomeSection()

    await setChromeStorage({ homeSection: false })
    await setChromeStorage({ currentTabSection: false })
    await setChromeStorage({ allTabsSection: false })
    await setChromeStorage({ gptSection: false })
    await setChromeStorage({ dashboardSection: false })
    await setChromeStorage({ profileSection: false })

    await setChromeStorage({ dashboardSectionCollections: false })
    await setChromeStorage({ dashboardSectionFavorites: false })
    await setChromeStorage({ dashboardSectionLinks: false })
    await setChromeStorage({ dashboardSectionImages: false })
    await setChromeStorage({ dashboardSectionVideos: false })
    await setChromeStorage({ dashboardSectionArticles: false })
    await setChromeStorage({ dashboardSectionSettings: false })
    await setChromeStorage({ dashboardSectionHelpCenter: false })

    await setChromeStorage({ dashboardSectionCardDisplay: false })
    await setChromeStorage({ dashboardSectionListDisplay: false })

    await setChromeStorage({ mainGptSection: true })
    await setChromeStorage({ gptTranslateSection: false })
    await setChromeStorage({ gptOCRSection: false })

    await setChromeStorage({ openInANewTab: false })

    await setChromeStorage({
      isGoogle: true,
      isGoogleScholar: false,
    })

    setToken(null)
    setUser(null)

    if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ type: 'USER_LOGGED_OUT' })
    }
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        logout,
        fetchAllFolders,
        fetchDetailsAssociatedWithBookmarks,
        getUserStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
