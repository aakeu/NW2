import React from 'react'
import './MenuBar.css'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../state'
import { setActiveLoginType } from '../../state/slice/loginModalSlice'
import { setActiveSection } from '../../state/slice/sectionSlice'
import { initializeBookmarkParentName, initializeBookmarks, initializeChildBookmarks } from '../../state/slice/bookmarkSlice'
import { initializeChildFolders, initializeCollectionAncestorFolders, initializeFolders } from '../../state/slice/folderSlice'
import { fetchAllFavorites, initializeFavorites } from '../../state/slice/favoriteSlice'
import { fetchAllImages, initializeImages } from '../../state/slice/imageSlice'
import { fetchAllVideos, initializeVideos } from '../../state/slice/videoSlice'
import { fetchAllArticles, initializeArticles } from '../../state/slice/articleSlice'
import { setFilteredMedia, setFilteredMediaTitle, setIsFilteredMedia } from '../../state/slice/reusableStatesSlice'
import { openLink } from '../reusables/Reusables'

interface ImageTextProps {
  imageSrc: string | undefined
  text?: string
  className: string
  style?: {}
}

const MenuBarContent: React.FC<ImageTextProps> = ({
  imageSrc,
  text,
  className,
  style,
}) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode)
  const { token, user } = useSelector((state: RootState) => state.auth);
  const openInNewTab = useSelector(
    (state: RootState) => state.openInNewTab.openInNewTab,
  );
  const dispatch = useDispatch<AppDispatch>()

  const handleSetting = async () => {
    openLink('https://quicksearchplus.com/dashboard?page=setting', openInNewTab);
  }

  const initializeData = async () => {
    await Promise.all([
      dispatch(setActiveSection('dashboardSection')),
      dispatch(initializeBookmarks()),
      dispatch(initializeBookmarkParentName()),
      dispatch(initializeChildBookmarks()),
      dispatch(initializeFolders()),
      dispatch(initializeChildFolders()),
      dispatch(initializeCollectionAncestorFolders()),
      dispatch(setIsFilteredMedia(false)),
      dispatch(setFilteredMediaTitle(null)),
      dispatch(setFilteredMedia(null))
    ])
  }

  const initializeFavoriteData = async () => {
    await Promise.all([
      dispatch(setActiveSection('dashboardFavoritesSection')),
      dispatch(fetchAllFavorites()),
      dispatch(initializeFavorites()),
      dispatch(setIsFilteredMedia(false)),
      dispatch(setFilteredMediaTitle(null)),
      dispatch(setFilteredMedia(null))
    ])
  }
  
  const initializeAllImages = async () => {
    await Promise.all([
      dispatch(setActiveSection('dashboardImagesSection')),
      dispatch(fetchAllImages()),
      dispatch(initializeImages()),
      dispatch(setIsFilteredMedia(false)),
      dispatch(setFilteredMediaTitle(null)),
      dispatch(setFilteredMedia(null))
    ])
  }
  
  const initializeAllVideos = async () => {
    await Promise.all([
      dispatch(setActiveSection('dashboardVideosSection')),
      dispatch(fetchAllVideos()),
      dispatch(initializeVideos()),
      dispatch(setIsFilteredMedia(false)),
      dispatch(setFilteredMediaTitle(null)),
      dispatch(setFilteredMedia(null))
    ])
  }
  
  const initializeAllArticles = async () => {
    await Promise.all([
      dispatch(setActiveSection('dashboardArticlesSection')),
      dispatch(fetchAllArticles()),
      dispatch(initializeArticles()),
      dispatch(setIsFilteredMedia(false)),
      dispatch(setFilteredMediaTitle(null)),
      dispatch(setFilteredMedia(null))
    ])
  }

  return (
    <div
      style={style}
      className={`menuBarContentDetails ${
        text === 'Login' && 'menuBarContentDetailsExtra'
      } ${
        isDarkMode && text === 'Home'
          ? 'menuBarContentsExtraDark'
          : !isDarkMode && text === 'Home'
          ? 'menuBarContentsExtra'
          : ''
      }`}
      onClick={
        text === 'Login'
          ? () => dispatch(setActiveLoginType('signInModal'))
          : text === "Home" ? () => dispatch(setActiveSection('homeSection')) 
          : text === "Current Tab" ? !token ? () => dispatch(setActiveLoginType('signInModal')) : () => dispatch(setActiveSection("tabSection")) 
          : text === "Save All tabs" ? !token ? () => dispatch(setActiveLoginType('signInModal')) : ()  => dispatch(setActiveSection("allTabsSection"))
          : text === "AI" ? !token ? () => dispatch(setActiveLoginType('signInModal')) : () => dispatch(setActiveSection('chatSection')) 
          : text === "OCR" ? !token ? () => dispatch(setActiveLoginType('signInModal')) : () => dispatch(setActiveSection('ocrSection')) 
          : text === "Translate" ? !token ? () => dispatch(setActiveLoginType('signInModal')) : () => dispatch(setActiveSection('translateSection')) 
          : text === "Dash" ? () => initializeData()
          : text === "Collection" ? () => dispatch(setActiveSection('dashboardCollectionSection')) 
          : text === "Favorites" ? () => initializeFavoriteData()
          : text === "Links" ? () => dispatch(setActiveSection('dashboardLinksSection')) 
          : text === "Images" ? () => initializeAllImages()
          : text === "Videos" ? () => initializeAllVideos()
          : text === "Articles" ? () => initializeAllArticles()
          : text === "Setting" ? () => handleSetting()
          : text === "Meetings" ? () => dispatch(setActiveSection('dashboardMeetingsSection'))
          : () => {}
      }
    >
      <img
        src={imageSrc}
        alt={text ? text : 'menu icon'}
        className={`menuBarContentIcon ${text === "AI" ? 'menuBarContentIconAI' : ''}`}
      />
      <span className={`${className} ${text === "AI" ? 'menuBarContentTextAI' : ''}`}>{text}</span>
    </div>
  )
}

export default MenuBarContent
