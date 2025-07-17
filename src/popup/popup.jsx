import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { useDispatch, useSelector } from 'react-redux'
import './popup.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import 'react-toastify/dist/ReactToastify.css'
import Header from '../popupComponents/header/Header'
import Footer from '../popupComponents/footer/Footer'
import HomeSection from '../popupComponents/home/HomeSection'
import { Provider } from 'react-redux'
import store from '../popupState/store'
import { NotificationProvider } from '../popupComponents/notification/NotificationContext'
import { scheduleTokenRefreshCronJob } from '../utils/scheduleTokenRefresh'
import { getSecureToken, setSecureToken } from '../api/auth'
import { AuthProvider } from '../utils/AuthContext'
import CreateFolder from '../popupComponents/createFolder/CreateFolder'
import Backdrop from '../popupComponents/backdrop/Backdrop'
import {
  bookmarkFoldersUpdate,
  deleteQuickSearchFolder,
  getChromeStorage,
  populateDefaultFolders,
  setChromeStorage,
} from '../utils/utility'
import {
  filteredArticlesData,
  filteredBookmarksData,
  filteredFavoritesData,
  filteredImagesData,
  filteredVideosData,
} from '../utils/filteredData'
import CurrentTabSection from '../popupComponents/currentTab/CurrentTabSection'
import AllTabsSection from '../popupComponents/allTabs/AllTabsSection'
import GptSection from '../popupComponents/gpt/GptSection'
import DashboardSection from '../popupComponents/dashboard/DashboardSection'
import ProfileSection from '../popupComponents/profile/ProfileSection'
import { organizeGptHistory } from '../utils/organizeGptHistory'
import { get_tracking_record, get_user_status } from '../api/users'
import { setGoogleStoredQuery } from '../popupState/slice/browserSlice'
import { getChildBookmarks, getChildFolders } from '../utils/dashboardUtility'

const Popup = () => {
  const [userDetail, setUserDetail] = useState(null)
  const [showFolderModal, setShowFolderModal] = useState(false)
  const [allFolders, setAllFolders] = useState(null)
  const [allBookmarks, setAllBookmarks] = useState(null)
  const [allImages, setAllImages] = useState(null)
  const [allVideos, setAllVideos] = useState(null)
  const [allArticles, setAllArticles] = useState(null)
  const [allFavorites, setAllFavorites] = useState(null)
  const [section, setSection] = useState('homeSection')
  const [dashboardSection, setDashboardSection] = useState(
    'dashboardSectionCollections',
  )
  const [dashboardSidebarContent, setDashboardSidebarContent] =
    useState('Collections')
  const [allGptStoredResults, setAllGptStoredResults] = useState(null)
  const [gptHistory, setGptHistory] = useState(null)
  const [dashboardSectionCardListDisplay, setDashboardSectionCardListDisplay] =
    useState('dashboardSectionCardDisplay')
  const [dashboardCollectionFolders, setDashboardCollectionFolders] =
    useState(null)
  const [
    dashboardCollectionFolderAncestors,
    setDashboardCollectionFolderAncestors,
  ] = useState(null)
  const [
    dashboardCollectionFolderBookmarks,
    setDashboardCollectionFolderBookmarks,
  ] = useState(null)
  const [isChecked, setIsChecked] = useState(false)
  const [existingDashboardImageDetail, setExistingDashboardImageDetail] =
    useState(null)
  const [existingDashboardArticleDetail, setExistingDashboardArticleDetail] =
    useState(null)
  const [existingDashboardVideoDetail, setExistingDashboardVideoDetail] =
    useState(null)
  const [trackingRecord, setTrackingRecord] = useState(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isQuickSearchLogoDesc, setIsQuickSearchLogoDesc] = useState(false)
  const [isSelectSearchEngineDesc, setIsSelectSearchEngineDesc] =
    useState(false)
  const [isCarryOutSearchDesc, setIsCarryOutSearchDesc] = useState(false)
  const [isOpenInANewTabDesc, setIsOpenInANewTabDesc] = useState(false)
  const [isGptToggleDesc, setIsGptToggleDesc] = useState(false)
  const [isVisitSiteDesc, setIsVisitSiteDesc] = useState(false)
  const [isSelectFolderForBookmarkDesc, setIsSelectFolderForBookmarkDesc] =
    useState(false)
  const [isBookmarkDesc, setIsBookmarkDesc] = useState(false)
  const [isMenuSideDesc, setIsMenuSideDesc] = useState(false)
  const [isGptChecked, setIsGptChecked] = useState(false)
  const [currentChatDetails, setCurrentChatDetails] = useState(false)
  const [selectedBookmarkParentName, setSelectedBookmarkParentName] =
    useState(null)

  const [gptSubSection, setGptSubSection] = useState('mainGptSection')

  const { googleStoredQuery } = useSelector((state) => state.browser)
  const dispatch = useDispatch()

  const handleBackToHomeOnboardingState = () => {
    setIsQuickSearchLogoDesc(true)
    setIsSelectSearchEngineDesc(false)
    setIsCarryOutSearchDesc(false)
    setIsOpenInANewTabDesc(false)
    setIsGptToggleDesc(false)
    setIsVisitSiteDesc(false)
    setIsSelectFolderForBookmarkDesc(false)
    setIsBookmarkDesc(false)
    setIsMenuSideDesc(false)
  }

  const handleOnboardingNext = () => {
    const stateSetters = [
      setIsQuickSearchLogoDesc,
      setIsSelectSearchEngineDesc,
      setIsCarryOutSearchDesc,
      setIsOpenInANewTabDesc,
      setIsGptToggleDesc,
      setIsVisitSiteDesc,
      setIsSelectFolderForBookmarkDesc,
      setIsBookmarkDesc,
      setIsMenuSideDesc,
    ]

    const currentState = [
      isQuickSearchLogoDesc,
      isSelectSearchEngineDesc,
      isCarryOutSearchDesc,
      isOpenInANewTabDesc,
      isGptToggleDesc,
      isVisitSiteDesc,
      isSelectFolderForBookmarkDesc,
      isBookmarkDesc,
      isMenuSideDesc,
    ]

    const currentIndex = currentState.findIndex((state) => state === true)

    if (currentIndex !== -1) {
      if (currentState[currentIndex] === isCarryOutSearchDesc) {
        dispatch(setGoogleStoredQuery({ query: 'History of tom and jerry' }))
      }
      stateSetters[currentIndex](false)

      const nextIndex = (currentIndex + 1) % stateSetters.length
      stateSetters[nextIndex](true)
    } else {
      stateSetters[0](true)
    }
  }

  const handleOnboardingBack = () => {
    const stateSetters = [
      setIsQuickSearchLogoDesc,
      setIsSelectSearchEngineDesc,
      setIsCarryOutSearchDesc,
      setIsOpenInANewTabDesc,
      setIsGptToggleDesc,
      setIsVisitSiteDesc,
      setIsSelectFolderForBookmarkDesc,
      setIsBookmarkDesc,
      setIsMenuSideDesc,
    ]

    const currentState = [
      isQuickSearchLogoDesc,
      isSelectSearchEngineDesc,
      isCarryOutSearchDesc,
      isOpenInANewTabDesc,
      isGptToggleDesc,
      isVisitSiteDesc,
      isSelectFolderForBookmarkDesc,
      isBookmarkDesc,
      isMenuSideDesc,
    ]

    const currentIndex = currentState.findIndex((state) => state === true)

    if (currentIndex !== -1) {
      stateSetters[currentIndex](false)

      const prevIndex =
        (currentIndex - 1 + stateSetters.length) % stateSetters.length
      stateSetters[prevIndex](true)
    } else {
      stateSetters[stateSetters.length - 1](true)
    }
  }

  useEffect(() => {
    const handleMessage = async (message, sender, sendResponse) => {
      try {
        if (message.type === 'USER_LOGGED_IN') {
          const token = await getSecureToken('token')
          const user = await getSecureToken('user')
          const folders = await getChromeStorage('allFolders')
          setUserDetail({ token, user })
          setAllFolders(folders)
          populateDefaultFolders()
          await getAndOrganizeData()
          await getStoredData()
        }

        if (message.type === 'USER_LOGGED_OUT') {
          setUserDetail(null)
          await deleteQuickSearchFolder()
          await handleGptSubSection()
        }

        if (message.type === 'USER_STATUS_FETCHED') {
          const token = await getSecureToken('token')
          const user = await getSecureToken('user')
          setUserDetail({ token, user })
        }

        if (message.type === 'FOLDERS_FETCHED') {
          await getStoredData()
          bookmarkFoldersUpdate()
        }

        if (message.type === 'BOOKMARK_DETAILS_FETCHED') {
          await getStoredData()
        }
        if (message.type === 'FETCH_STORED_GPT') {
          await getStoredData()
          await handleOrganizedGptHistory()
        }
        if (message.type === 'GPT_ACTIVE_DETAILS') {
          setCurrentChatDetails(true)
        }
        if (
          message.type === 'BACK_TO_DASHBOARD_SECTION_COLLECTIONS' ||
          message.type === 'BACK_TO_DASHBOARD_SECTION_IMAGES' ||
          message.type === 'BACK_TO_DASHBOARD_SECTION_VIDEOS' ||
          message.type === 'BACK_TO_DASHBOARD_SECTION_VIDEOS'
        ) {
          await getStoredData()
        }
        if (message.type === 'DASHBOARD_COLLECTION_FOLDERS') {
          const existingCollectionFolders = await getChromeStorage(
            'collectionFolders',
          )
          setDashboardCollectionFolders(existingCollectionFolders)
        }
        if (message.type === 'DASHBOARD_COLLECTION_ANCESTOR_FOLDERS') {
          const existingCollectionFolderAncestors = await getChromeStorage(
            'collectionFolderAncestors',
          )
          setDashboardCollectionFolderAncestors(
            existingCollectionFolderAncestors,
          )
        }
        if (message.type === 'DASHBOARD_COLLECTION_FOLDERS_BOOKMARKS') {
          const existingCollectionFolderBookmarks = await getChromeStorage(
            'collectionFolderBookmarks',
          )
          setDashboardCollectionFolderBookmarks(
            existingCollectionFolderBookmarks,
          )
        }

        if (message.type === 'DASHBOARD_IMAGE_DETAIL') {
          const existingDashboardImageDetail = await getChromeStorage(
            'dashboardImgDetail',
          )
          setExistingDashboardImageDetail(existingDashboardImageDetail)
        }

        if (message.type === 'DASHBOARD_ARTICLE_DETAIL') {
          const existingDashboardArticleDetail = await getChromeStorage(
            'dashboardArtDetail',
          )
          setExistingDashboardArticleDetail(existingDashboardArticleDetail)
        }

        if (message.type === 'DASHBOARD_VIDEO_DETAIL') {
          const existingDashboardVideoDetail = await getChromeStorage(
            'dashboardVidDetail',
          )
          setExistingDashboardVideoDetail(existingDashboardVideoDetail)
        }
        if (message.type === 'OPEN_IN_NEW_TAB') {
          const openInANewTab = await getChromeStorage('openInANewTab')
          setIsChecked(openInANewTab)
        }
        if (message.type === 'BACK_TO_HOME_SECTION') {
          const gptSection = await getChromeStorage('gptSection')
          setIsGptChecked(gptSection)
        }
        if (message.type === 'BACK_TO_GPT_SECTION') {
          const gptSection = await getChromeStorage('gptSection')
          setIsGptChecked(gptSection)
        }
        if (message.type === 'BACK_TO_CURRENT_TAB_SECTION') {
          const gptSection = await getChromeStorage('gptSection')
          setIsGptChecked(gptSection)
        }
        if (message.type === 'BACK_TO_ALL_TABS_SECTION') {
          const gptSection = await getChromeStorage('gptSection')
          setIsGptChecked(gptSection)
        }
        if (message.type === 'BACK_TO_DASHBOARD_SECTION') {
          const gptSection = await getChromeStorage('gptSection')
          setIsGptChecked(gptSection)
        }
        if (message.type === 'BACK_TO_PROFILE_SECTION') {
          const gptSection = await getChromeStorage('gptSection')
          setIsGptChecked(gptSection)
        }
        if (message.type === 'SELECTED_BOOKMARK_PARENT_NAME') {
          const selectedBookmarkParentName = await getChromeStorage(
            'selectedBookmarkParentName',
          )
          setSelectedBookmarkParentName(selectedBookmarkParentName)
          await getStoredData()
        }
        if (message.type === 'ONBOARDING') {
          setShowOnboarding(true)
        }
        if (message.type === 'CHAT_GPT_USED') {
          const trackingRecord = await get_tracking_record()
          setTrackingRecord(trackingRecord)
        }

        const sectionMappings = {
          BACK_TO_HOME_SECTION: 'homeSection',
          BACK_TO_CURRENT_TAB_SECTION: 'currentTabSection',
          BACK_TO_ALL_TABS_SECTION: 'allTabsSection',
          BACK_TO_GPT_SECTION: 'gptSection',
          BACK_TO_DASHBOARD_SECTION: 'dashboardSection',
          BACK_TO_PROFILE_SECTION: 'profileSection',
        }

        if (sectionMappings[message.type]) {
          setSection(sectionMappings[message.type])
        }

        const dashboardSectionMappings = {
          BACK_TO_DASHBOARD_SECTION_COLLECTIONS: 'dashboardSectionCollections',
          BACK_TO_DASHBOARD_SECTION_FAVORITES: 'dashboardSectionFavorites',
          BACK_TO_DASHBOARD_SECTION_LINKS: 'dashboardSectionLinks',
          BACK_TO_DASHBOARD_SECTION_IMAGES: 'dashboardSectionImages',
          BACK_TO_DASHBOARD_SECTION_VIDEOS: 'dashboardSectionVideos',
          BACK_TO_DASHBOARD_SECTION_ARTICLES: 'dashboardSectionArticles',
          BACK_TO_DASHBOARD_SECTION_SETTINGS: 'dashboardSectionSettings',
          BACK_TO_DASHBOARD_SECTION_HELPCENTER: 'dashboardSectionHelpCenter',
        }

        const dashboardSidebarContentMappings = {
          BACK_TO_DASHBOARD_SECTION_COLLECTIONS: 'Collections',
          BACK_TO_DASHBOARD_SECTION_FAVORITES: 'Favorites',
          BACK_TO_DASHBOARD_SECTION_LINKS: 'Links',
          BACK_TO_DASHBOARD_SECTION_IMAGES: 'Images',
          BACK_TO_DASHBOARD_SECTION_VIDEOS: 'Videos',
          BACK_TO_DASHBOARD_SECTION_ARTICLES: 'Articles',
          BACK_TO_DASHBOARD_SECTION_SETTINGS: 'Settings',
          BACK_TO_DASHBOARD_SECTION_HELPCENTER: 'Help Center',
        }

        const gptSectionOptionsMappings = {
          BACK_TO_MAIN_GPT_SECTION: 'mainGptSection',
          BACK_TO__GPT_TRANSLATE_SECTION: 'gptTranslateSection',
          BACK_TO__GPT_OCR_SECTION: 'gptOCRSection',
        }

        const dashboardSectionCardListMappings = {
          BACK_TO_DASHBOARD_SECTION_CARD_DISPLAY: 'dashboardSectionCardDisplay',
          BACK_TO_DASHBOARD_SECTION_LIST_DISPLAY: 'dashboardSectionListDisplay',
        }

        if (dashboardSectionMappings[message.type]) {
          setDashboardSection(dashboardSectionMappings[message.type])
        }
        if (dashboardSidebarContentMappings[message.type]) {
          setDashboardSidebarContent(
            dashboardSidebarContentMappings[message.type],
          )
        }
        if (dashboardSectionCardListMappings[message.type]) {
          setDashboardSectionCardListDisplay(
            dashboardSectionCardListMappings[message.type],
          )
        }

        if (gptSectionOptionsMappings[message.type]) {
          setGptSubSection(gptSectionOptionsMappings[message.type])
        }

        if (message.type === 'GET_STORED_DATA') {
          await getAndOrganizeData()
        }
        if (message.type === 'GET_GPT_DATA') {
          const gptStoredResult = await getChromeStorage('gptStoredResult')
          setAllGptStoredResults(gptStoredResult)
        }

        if (message.type === 'GPT_STORED') {
          await getAndOrganizeData()
        }
        return true
      } catch (error) {
        console.error('Error handling message:', error)
      }
    }

    chrome.runtime.onMessage.addListener(handleMessage)

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage)
    }
  }, [
    populateDefaultFolders,
    deleteQuickSearchFolder,
    bookmarkFoldersUpdate,
    getStoredData,
    getAndOrganizeData,
  ])

  useEffect(() => {
    async function refreshTokenCronJJob() {
      const token = await getSecureToken('token')
      if (token) {
        await scheduleTokenRefreshCronJob()
      }
    }
    refreshTokenCronJJob()
  }, [])

  useEffect(() => {
    async function retrieveToken() {
      const token = await getSecureToken('token')
      const user = await getSecureToken('user')
      setUserDetail({ token, user })
    }
    retrieveToken()
  }, [])

  useEffect(() => {
    const handleSection = async () => {
      const sectionKeys = [
        'homeSection',
        'currentTabSection',
        'allTabsSection',
        'gptSection',
        'dashboardSection',
        'profileSection',
      ]

      for (const key of sectionKeys) {
        const value = await getChromeStorage(key)
        if (value) {
          setSection(key)
          break
        }
      }
    }

    handleSection()
  }, [])

  const handleGptSubSection = async () => {
    const gptSubSectionKeys = [
      'mainGptSection',
      'gptTranslateSection',
      'gptOCRSection',
    ]

    for (const key of gptSubSectionKeys) {
      const value = await getChromeStorage(key)
      if (value) {
        setGptSubSection(key)
        break
      }
    }
  }
  useEffect(() => {
    handleGptSubSection()
  }, [])

  useEffect(() => {
    const handleDashboardSection = async () => {
      const dashboardSectionKeys = [
        'dashboardSectionCollections',
        'dashboardSectionFavorites',
        'dashboardSectionLinks',
        'dashboardSectionImages',
        'dashboardSectionVideos',
        'dashboardSectionArticles',
        'dashboardSectionSettings',
        'dashboardSectionHelpCenter',
      ]

      const dashboardSidebarContentsKey = {
        dashboardSectionCollections: 'Collections',
        dashboardSectionFavorites: 'Favorites',
        dashboardSectionLinks: 'Links',
        dashboardSectionImages: 'Images',
        dashboardSectionVideos: 'Videos',
        dashboardSectionArticles: 'Articles',
        dashboardSectionSettings: 'Settings',
        dashboardSectionHelpCenter: 'Help Center',
      }

      const dashboardSectionCardListDisplayKeys = [
        'dashboardSectionCardDisplay',
        'dashboardSectionListDisplay',
      ]

      for (const key of dashboardSectionKeys) {
        const value = await getChromeStorage(key)
        if (value) {
          setDashboardSection(key)
          break
        }
      }

      for (const key of Object.keys(dashboardSidebarContentsKey)) {
        const value = await getChromeStorage(key)
        if (value) {
          setDashboardSidebarContent(dashboardSidebarContentsKey[key])
          break
        }
      }

      for (const key of dashboardSectionCardListDisplayKeys) {
        const value = await getChromeStorage(key)
        if (value) {
          setDashboardSectionCardListDisplay(key)
          break
        }
      }
    }
    handleDashboardSection()
  }, [])

  const getAndOrganizeData = async () => {
    await getStoredData()
    await handleOrganizedGptHistory()
    // setCurrentChatDetails(true)
  }

  const getStoredData = async () => {
    const token = await getSecureToken('token')
    if (token) {
      await filteredBookmarksData()
      await filteredFavoritesData()
      await filteredImagesData()
      await filteredVideosData()
      await filteredArticlesData()
      const existingDashboardImageDetail = await getChromeStorage(
        'dashboardImgDetail',
      )
      const existingDashboardArticleDetail = await getChromeStorage(
        'dashboardArtDetail',
      )
      const existingDashboardVideoDetail = await getChromeStorage(
        'dashboardVidDetail',
      )
      const selectedBookmarkParentName =
        (await getChromeStorage('selectedBookmarkParentName')) || '/'

      const trackingRecord = await get_tracking_record()
      const openInANewTab = await getChromeStorage('openInANewTab')
      setIsChecked(openInANewTab)
      setTrackingRecord(trackingRecord)
      const gptSection = await getChromeStorage('gptSection')
      setIsGptChecked(gptSection)
      const folders = await getChromeStorage('allFolders')
      const favorites = await getChromeStorage('allFavorites')
      const bookmarks = await getChromeStorage('allBookmarks')
      const images = await getChromeStorage('allImages')
      const videos = await getChromeStorage('allVideos')
      const articles = await getChromeStorage('allArticles')
      const gptStoredResult = await getChromeStorage('gptStoredResult')
      setAllGptStoredResults(gptStoredResult)
      setExistingDashboardImageDetail(existingDashboardImageDetail)
      setExistingDashboardArticleDetail(existingDashboardArticleDetail)
      setExistingDashboardVideoDetail(existingDashboardVideoDetail)

      setSelectedBookmarkParentName(selectedBookmarkParentName)

      setAllFolders(folders)
      setAllBookmarks(bookmarks)
      setAllImages(images)
      setAllVideos(videos)
      setAllArticles(articles)
      setAllFavorites(favorites)
      bookmarkFoldersUpdate()

      if (Array.isArray(bookmarks) && bookmarks.length > 0) {
        const selectedDashboardFolderBookmarks = await getChildBookmarks(
          selectedBookmarkParentName,
          bookmarks,
        )
        setDashboardCollectionFolderBookmarks(selectedDashboardFolderBookmarks)

        await setChromeStorage({
          collectionFolderBookmarks: selectedDashboardFolderBookmarks,
        })
      }
      if (Array.isArray(folders) && folders.length > 0) {
        const selectedDashboardFolders = await getChildFolders(
          selectedBookmarkParentName,
          folders,
        )
        setDashboardCollectionFolders(selectedDashboardFolders)
        await setChromeStorage({
          collectionFolders: selectedDashboardFolders,
        })
      }
    }
    const openInANewTab = await getChromeStorage('openInANewTab')
    setIsChecked(openInANewTab)
  }

  useEffect(() => {
    async function storedData() {
      await getStoredData()
    }
    storedData()
  }, [])

  const handleOrganizedGptHistory = async () => {
    const gptStoredResult = await getChromeStorage('gptStoredResult')
    const organizedHistory = await organizeGptHistory(gptStoredResult)
    const organizedData = []
    Object.keys(organizedHistory).map((history) => {
      if (history === 'today') {
        const data = {
          day: 'Today',
          data: organizedHistory[history],
        }
        organizedData.push(data)
      } else if (history === 'yesterday') {
        const data = {
          day: 'Yesterday',
          data: organizedHistory[history],
        }
        organizedData.push(data)
      } else if (history === 'previous7Days') {
        const data = {
          day: 'Previous 7 Days',
          data: organizedHistory[history],
        }
        organizedData.push(data)
      } else if (history === 'previous30Days') {
        const data = {
          day: 'Previous 30 Days',
          data: organizedHistory[history],
        }
        organizedData.push(data)
      } else if (history === 'older') {
        const data = {
          day: 'Older',
          data: organizedHistory[history],
        }
        organizedData.push(data)
      }
      setGptHistory(organizedData)
    })
  }
  useEffect(() => {
    getAndOrganizeData()
  }, [])

  return (
    <>
      <Header
        userDetail={userDetail}
        allFolders={allFolders}
        allBookmarks={allBookmarks}
        isGptChecked={isGptChecked}
      />
      <div className="main_container">
        {section === 'homeSection' && (
          <HomeSection
            userDetail={userDetail}
            setShowFolderModal={setShowFolderModal}
            allFolders={allFolders}
            trackingRecord={trackingRecord}
            showOnboarding={showOnboarding}
            setShowOnboarding={setShowOnboarding}
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            isQuickSearchLogoDesc={isQuickSearchLogoDesc}
            isSelectSearchEngineDesc={isSelectSearchEngineDesc}
            isCarryOutSearchDesc={isCarryOutSearchDesc}
            isOpenInANewTabDesc={isOpenInANewTabDesc}
            isGptToggleDesc={isGptToggleDesc}
            isVisitSiteDesc={isVisitSiteDesc}
            isSelectFolderForBookmarkDesc={isSelectFolderForBookmarkDesc}
            isBookmarkDesc={isBookmarkDesc}
            isMenuSideDesc={isMenuSideDesc}
            setIsQuickSearchLogoDesc={setIsQuickSearchLogoDesc}
            handleOnboardingNext={handleOnboardingNext}
            handleOnboardingBack={handleOnboardingBack}
            defaultQuery={googleStoredQuery}
            isChecked={isChecked}
          />
        )}
        {section === 'currentTabSection' && (
          <CurrentTabSection
            allFolders={allFolders}
            setShowFolderModal={setShowFolderModal}
            trackingRecord={trackingRecord}
            userDetail={userDetail}
          />
        )}
        {section === 'allTabsSection' && (
          <AllTabsSection
            allFolders={allFolders}
            setShowFolderModal={setShowFolderModal}
            allBookmarks={allBookmarks}
            setAllBookmarks={setAllBookmarks}
            trackingRecord={trackingRecord}
            userDetail={userDetail}
          />
        )}
        {section === 'gptSection' && (
          <GptSection
            allGptStoredResults={allGptStoredResults}
            gptHistory={gptHistory}
            userDetail={userDetail}
            trackingRecord={trackingRecord}
            gptSubSection={gptSubSection}
            currentChatDetails={currentChatDetails}
          />
        )}
        {section === 'dashboardSection' && (
          <DashboardSection
            dashboardSection={dashboardSection}
            dashboardSidebarContent={dashboardSidebarContent}
            dashboardSectionCardListDisplay={dashboardSectionCardListDisplay}
            allFolders={allFolders}
            allBookmarks={allBookmarks}
            dashboardCollectionFolders={dashboardCollectionFolders}
            dashboardCollectionFolderAncestors={
              dashboardCollectionFolderAncestors
            }
            dashboardCollectionFolderBookmarks={
              dashboardCollectionFolderBookmarks
            }
            isChecked={isChecked}
            allFavorites={allFavorites}
            allImages={allImages}
            existingDashboardImageDetail={existingDashboardImageDetail}
            allArticles={allArticles}
            existingDashboardArticleDetail={existingDashboardArticleDetail}
            allVideos={allVideos}
            existingDashboardVideoDetail={existingDashboardVideoDetail}
            trackingRecord={trackingRecord}
            userDetail={userDetail}
            selectedBookmarkParentName={selectedBookmarkParentName}
          />
        )}
        {section === 'profileSection' && (
          <ProfileSection userDetail={userDetail} />
        )}
      </div>
      <Footer
        isChecked={isChecked}
        setIsChecked={setIsChecked}
        setShowOnboarding={setShowOnboarding}
        handleBackToHomeOnboardingState={handleBackToHomeOnboardingState}
        userDetail={userDetail}
      />
      {showFolderModal && (
        <>
          <Backdrop />
          <CreateFolder
            setShowFolderModal={setShowFolderModal}
            allFolders={allFolders}
          />
        </>
      )}
    </>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <Provider store={store}>
    <AuthProvider>
      <NotificationProvider>
        <Popup />
      </NotificationProvider>
    </AuthProvider>
  </Provider>,
)
