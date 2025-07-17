import React, { useEffect, useRef, useState } from 'react'
import '../dashboard/DashboardSection.css'
import DashboardSidebarContent from './DashboardSidebarContent'
import DashboardCollectionSection from './DashboardCollectionSection'
import DashboardFavoritesSection from './DashboardFavoritesSection'
import DashboardLinksSection from './DashboardLinksSection'
import DashboardImagesSection from './DashboardImagesSection'
import DashboardVideosSection from './DashboardVideosSection'
import DashboardArticlesSection from './DashboardArticlesSection'
import DashboardSettingsSection from './DashboardSettingsSection'
import DashboardHelpCenterSection from './DashboardHelpCenterSection'
import DashboardCreateFolderModal from './DashboardCreateFolderModal'
import Backdrop from '../backdrop/Backdrop'
import DashboardRenameModal from './DashboardRenameModal'
import DashboardSectionDeleteModal from './DashboardSectionDeleteModal'
import {
  backToDashboardSectionCardDisplay,
  backToDashboardSectionListDisplay,
} from '../../utils/sectionManagement'
import { getChromeStorage } from '../../utils/utility'
import { getChildFolders } from '../../utils/dashboardUtility'
import DashboardGenericDelete from './DashboardGenericDelete'
import PaymentModal from '../paymentModal/PaymentModal'
import DashboardSearchInput from './DashboardSearchInput'

export default function DashboardSection({
  dashboardSection,
  dashboardSidebarContent,
  dashboardSectionCardListDisplay,
  allFolders,
  allBookmarks,
  dashboardCollectionFolders,
  dashboardCollectionFolderAncestors,
  dashboardCollectionFolderBookmarks,
  isChecked,
  allFavorites,
  allImages,
  existingDashboardImageDetail,
  allArticles,
  existingDashboardArticleDetail,
  allVideos,
  existingDashboardVideoDetail,
  trackingRecord,
  userDetail,
  selectedBookmarkParentName,
}) {
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [openCreateFolderModal, setOpenCreateFolderModal] = useState(false)
  const [openRenameFolderModal, setOpenRenameFolderModal] = useState(false)
  const [openDeleteModal, setOpenDeleteModal] = useState(false)
  const [collectionFolders, setCollectionFolders] = useState(null)
  const [collectionFolderAncestors, setCollectionFolderAncestors] =
    useState(null)
  const [collectionFolderBookmarks, setCollectionFolderBookmarks] =
    useState(null)
  const [folderIdToRename, setFolderIdToRename] = useState(null)
  const [deleteDetails, setDeleteDetails] = useState(null)
  const [dashboardGenericDelete, setDashboardGenericDelete] = useState(null)
  const [dashboardGenericNoFolderDelete, setDashboardGenericNoFolderDelete] =
    useState(null)
  const [activationNeeded, setActivationNeeded] = useState(false)
  const [paymentModalInfo, setPaymentModalInfo] = useState(null)
  const [
    searchedCollectionBookmarkResults,
    setSearchCollectionBookmarkResults,
  ] = useState(null)
  const [searchCollectionFolderResults, setSearchCollectionFolderResults] =
    useState(null)
  const [query, setQuery] = useState('')
  const [searchFavoriteResults, setSearchFavoriteResults] = useState(null)
  const [searchLinksResult, setSearchLinksResults] = useState(null)
  const [searchImagesResults, setSearchImagesResults] = useState(null)
  const [searchVideosResults, setSearchVideosResults] = useState(null)
  const [searchArticlesResults, setSearchArticlesResults] = useState(null)
  const hideFilterMenuTimeoutRef = useRef(null)

  const handleDashboardGenericNoFolderDelete = async (
    name,
    id,
    isFolder,
    isImageFolder,
    isImage,
    isVideoFolder,
    isVideo,
    isArticleFolder,
    isArticle,
  ) => {
    setDashboardGenericNoFolderDelete({
      name,
      id,
      isFolder,
      isImageFolder,
      isImage,
      isVideoFolder,
      isVideo,
      isArticleFolder,
      isArticle,
    })
  }

  const handleCloseGenericNoFolderDeleteModal = async () => {
    setDashboardGenericNoFolderDelete({ name: null, id: null })
  }
  const handleDashboardGenericDelete = async (
    name,
    id,
    isFolder,
    isImageFolder,
    isImage,
    isVideoFolder,
    isVideo,
    isArticleFolder,
    isArticle,
  ) => {
    setDashboardGenericDelete({
      name,
      id,
      isFolder,
      isImageFolder,
      isImage,
      isVideoFolder,
      isVideo,
      isArticleFolder,
      isArticle,
    })
  }

  const handleCloseGenericDeleteModal = async () => {
    setDashboardGenericDelete({ name: null, id: null })
  }

  const getDashboardCollectionFolders = async () => {
    try {
      const folders = await getChromeStorage('collectionFolders')
      setCollectionFolders(folders)
    } catch (error) {
      // console.error('Error fetching collection folders:', error)
    }
  }

  const getDashboardCollectionFolderAncestors = async () => {
    try {
      const ancestors = await getChromeStorage('collectionFolderAncestors')
      setCollectionFolderAncestors(ancestors)
    } catch (error) {
      // console.error('Error fetching folder ancestors:', error)
    }
  }

  const getDashboardCollectionFolderBookmarks = async () => {
    try {
      const bookmarks = await getChromeStorage('collectionFolderBookmarks')
      setCollectionFolderBookmarks(bookmarks)
    } catch (error) {
      // console.error('Error fetching folder bookmarks:', error)
    }
  }

  useEffect(() => {
    getDashboardCollectionFolders()
    getDashboardCollectionFolderAncestors()
    getDashboardCollectionFolderBookmarks()
  }, [allFolders, allBookmarks])

  const handleOpenDeleteModal = (
    id,
    name,
    isFolder,
    isBookmark,
    isFavorite,
  ) => {
    setTimeout(async () => {
      const folders = await getChromeStorage('collectionFolderAncestors')
      setCollectionFolderAncestors(folders)
      setOpenDeleteModal(true)
      setDeleteDetails({ id, name, isFolder, isBookmark, isFavorite })
    }, 200)
  }

  const handleCloseDeleteModal = () => {
    setTimeout(() => {
      setOpenDeleteModal(false)
      setDeleteDetails(null)
    }, 200)
  }
  const handleOpenCreateFolderModal = () => {
    if (
      trackingRecord &&
      trackingRecord.numberOfFolders > 4 &&
      !userDetail?.user?.isSubscribed
    ) {
      setActivationNeeded(true)
      setPaymentModalInfo(
        'You have exceeded the number of folders for a free plan, upgrade your plan to continue using this service!',
      )
    } else {
      setTimeout(async () => {
        const folders = await getChromeStorage('collectionFolderAncestors')
        setCollectionFolderAncestors(folders)
        setOpenCreateFolderModal(true)
      }, 200)
    }
  }

  const handleCloseCreateFolderModal = () => {
    setTimeout(() => {
      setOpenCreateFolderModal(false)
    }, 200)
  }

  const handleOpenRenameModal = (id) => {
    setTimeout(async () => {
      const folders = await getChromeStorage('collectionFolderAncestors')
      setCollectionFolderAncestors(folders)
      setOpenRenameFolderModal(true)
      setFolderIdToRename(id)
    }, 200)
  }

  const handleCloseRenameModal = () => {
    setTimeout(() => {
      setOpenRenameFolderModal(false)
    }, 200)
  }

  const handleCardDisplay = async () => {
    setTimeout(() => {
      backToDashboardSectionCardDisplay()
    }, 200)
  }
  const handleListDisplay = async () => {
    setTimeout(() => {
      backToDashboardSectionListDisplay()
    }, 200)
  }

  const handleShowFilterMenu = () => {
    if (hideFilterMenuTimeoutRef.current) {
      clearTimeout(hideFilterMenuTimeoutRef.current)
    }
    setShowFilterMenu(true)
  }

  const handleHideFilterMenu = () => {
    hideFilterMenuTimeoutRef.current = setTimeout(() => {
      setShowFilterMenu(false)
    }, 200)
  }

  return (
    <>
      <div className="dashboardContainer">
        {userDetail && userDetail?.user?.status !== 'active' && (
          <div className="dashboardReminder">
            Please verify your email, check your registered email address and
            click on the link to get access to the full features...
          </div>
        )}
        <div className="dashboardContentContainer">
          <div className="dashboardSidebar">
            <DashboardSidebarContent
              img="images/popup/collectionIcon.svg"
              selectedImg="images/popup/selectedCollectionIcon.svg"
              text="Collections"
              dashboardSidebarContent={dashboardSidebarContent}
            />
            <DashboardSidebarContent
              img="images/popup/favoriteIcon.svg"
              selectedImg="images/popup/selectedFavoriteIcon.svg"
              text="Favorites"
              dashboardSidebarContent={dashboardSidebarContent}
            />
            <DashboardSidebarContent
              img="images/popup/linkIcon.svg"
              selectedImg="images/popup/selectedLinkIcon.svg"
              text="Links"
              dashboardSidebarContent={dashboardSidebarContent}
            />
            <DashboardSidebarContent
              img="images/popup/imageIcon.svg"
              selectedImg="images/popup/imageIcon.svg"
              text="Images"
              dashboardSidebarContent={dashboardSidebarContent}
            />
            <DashboardSidebarContent
              img="images/popup/videoIcon.svg"
              selectedImg="images/popup/videoIcon.svg"
              text="Videos"
              dashboardSidebarContent={dashboardSidebarContent}
            />
            <DashboardSidebarContent
              img="images/popup/articleIcon.svg"
              selectedImg="images/popup/articleIcon.svg"
              text="Articles"
              dashboardSidebarContent={dashboardSidebarContent}
            />
            <DashboardSidebarContent
              img="images/popup/settingsIcon.svg"
              selectedImg="images/popup/settingsIcon.svg"
              text="Settings"
              extra={true}
              dashboardSidebarContent={dashboardSidebarContent}
            />
            <DashboardSidebarContent
              img="images/popup/helpIcon.svg"
              selectedImg="images/popup/helpIcon.svg"
              text="Help Center"
              dashboardSidebarContent={dashboardSidebarContent}
            />
          </div>
          <div className="dashboardMain">
            <div className="dashboardMainHeader">
              <div className="dashboardMainHeaderSearchContainer">
                <span className="dashboardHeaderName">
                  {dashboardSidebarContent}
                </span>
                <div className="dashboardHeaderSearchHolder">
                  <DashboardSearchInput
                    selectedBookmarkParentName={selectedBookmarkParentName}
                    allFolders={allFolders}
                    allBookmarks={allBookmarks}
                    setSearchCollectionBookmarkResults={
                      setSearchCollectionBookmarkResults
                    }
                    setSearchCollectionFolderResults={
                      setSearchCollectionFolderResults
                    }
                    setCollectionFolders={setCollectionFolders}
                    setCollectionFolderBookmarks={setCollectionFolderBookmarks}
                    query={query}
                    setQuery={setQuery}
                    dashboardSection={dashboardSection}
                    allFavorites={allFavorites}
                    setSearchFavoriteResults={setSearchFavoriteResults}
                    setSearchLinksResults={setSearchLinksResults}
                    setSearchImagesResults={setSearchImagesResults}
                    allImages={allImages}
                    existingDashboardImageDetail={existingDashboardImageDetail}
                    setSearchVideosResults={setSearchVideosResults}
                    allVideos={allVideos}
                    existingDashboardVideoDetail={existingDashboardVideoDetail}
                    setSearchArticlesResults={setSearchArticlesResults}
                    allArticles={allArticles}
                    existingDashboardArticleDetail={
                      existingDashboardArticleDetail
                    }
                  />
                  <img
                    src="images/popup/dashboardFilterIcon.svg"
                    alt="icon"
                    className="dashboardFilterIconImg"
                    onMouseEnter={handleShowFilterMenu}
                    onMouseLeave={handleHideFilterMenu}
                  />
                  {showFilterMenu && (
                    <div
                      className="dashboardMainHeaderFilterMenu"
                      onMouseEnter={handleShowFilterMenu}
                      onMouseLeave={handleHideFilterMenu}
                    >
                      <div className="dashboardMainHeaderFilterMenuContent">
                        <span className="dashboardMainHeaderFilterMenuText">
                          Recent
                        </span>
                        <span className="dashboardMainHeaderFilterMenuText">
                          Name
                        </span>
                        <span className="dashboardMainHeaderFilterMenuText">
                          A - Z
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="dashboardMainHeaderCardTileContainer">
                <div className="dashboardMainHeaderNewFolderIconHolder">
                  {dashboardSection === 'dashboardSectionCollections' && (
                    <>
                      <span className="dashboardMainHeaderCardText">
                        New Folder
                      </span>
                      <img
                        src="images/popup/addIcon.svg"
                        alt="icon"
                        className="dashboardMainHeaderAddIcon"
                        onClick={handleOpenCreateFolderModal}
                      />
                    </>
                  )}
                  <img
                    src={'images/popup/cardIcon.svg'}
                    alt="icon"
                    className="dashboardMainHeaderCardIcon"
                    onClick={handleCardDisplay}
                  />
                  <img
                    src={
                      dashboardSectionCardListDisplay ===
                      'dashboardSectionListDisplay'
                        ? 'images/popup/listSelected.svg'
                        : 'images/popup/listIcon.svg'
                    }
                    alt="icon"
                    className="dashboardMainHeaderListIcon"
                    onClick={handleListDisplay}
                  />
                </div>
              </div>
            </div>
            {dashboardSection === 'dashboardSectionCollections' && (
              <DashboardCollectionSection
                handleOpenRenameModal={handleOpenRenameModal}
                handleOpenDeleteModal={handleOpenDeleteModal}
                dashboardSectionCardListDisplay={
                  dashboardSectionCardListDisplay
                }
                dashboardCollectionFolders={
                  query && searchCollectionFolderResults
                    ? searchCollectionFolderResults
                    : dashboardCollectionFolders
                    ? dashboardCollectionFolders
                    : collectionFolders
                }
                dashboardCollectionFolderAncestors={
                  dashboardCollectionFolderAncestors
                    ? dashboardCollectionFolderAncestors
                    : collectionFolderAncestors
                }
                allFolders={allFolders}
                allBookmarks={allBookmarks}
                dashboardCollectionFolderBookmarks={
                  query && searchedCollectionBookmarkResults
                    ? searchedCollectionBookmarkResults
                    : dashboardCollectionFolderBookmarks
                    ? dashboardCollectionFolderBookmarks
                    : collectionFolderBookmarks
                }
                isChecked={isChecked}
                selectedBookmarkParentName={selectedBookmarkParentName}
                setQuery={setQuery}
              />
            )}
            {dashboardSection === 'dashboardSectionFavorites' && (
              <DashboardFavoritesSection
                handleOpenDeleteModal={handleOpenDeleteModal}
                allFavorites={allFavorites}
                isChecked={isChecked}
                dashboardSectionCardListDisplay={
                  dashboardSectionCardListDisplay
                }
                searchFavoriteResults={
                  query && searchFavoriteResults
                    ? searchFavoriteResults
                    : allFavorites
                }
              />
            )}
            {dashboardSection === 'dashboardSectionLinks' && (
              <DashboardLinksSection
                handleOpenDeleteModal={handleOpenDeleteModal}
                allBookmarks={allBookmarks}
                isChecked={isChecked}
                dashboardSectionCardListDisplay={
                  dashboardSectionCardListDisplay
                }
                searchLinksResult={
                  query && searchLinksResult ? searchLinksResult : allBookmarks
                }
              />
            )}
            {dashboardSection === 'dashboardSectionImages' && (
              <DashboardImagesSection
                allImages={allImages}
                dashboardSectionCardListDisplay={
                  dashboardSectionCardListDisplay
                }
                existingDashboardImageDetail={existingDashboardImageDetail}
                handleDashboardGenericDelete={handleDashboardGenericDelete}
                handleDashboardGenericNoFolderDelete={
                  handleDashboardGenericNoFolderDelete
                }
                searchImagesResults={
                  query && searchImagesResults ? searchImagesResults : allImages
                }
                query={query}
              />
            )}
            {dashboardSection === 'dashboardSectionVideos' && (
              <DashboardVideosSection
                allVideos={allVideos}
                dashboardSectionCardListDisplay={
                  dashboardSectionCardListDisplay
                }
                existingDashboardVideoDetail={existingDashboardVideoDetail}
                handleDashboardGenericDelete={handleDashboardGenericDelete}
                handleDashboardGenericNoFolderDelete={
                  handleDashboardGenericNoFolderDelete
                }
                searchVideosResults={
                  query && searchVideosResults ? searchVideosResults : allVideos
                }
                query={query}
              />
            )}
            {dashboardSection === 'dashboardSectionArticles' && (
              <DashboardArticlesSection
                allArticles={allArticles}
                dashboardSectionCardListDisplay={
                  dashboardSectionCardListDisplay
                }
                existingDashboardArticleDetail={existingDashboardArticleDetail}
                handleDashboardGenericDelete={handleDashboardGenericDelete}
                handleDashboardGenericNoFolderDelete={
                  handleDashboardGenericNoFolderDelete
                }
                searchArticlesResults={
                  query && searchArticlesResults
                    ? searchArticlesResults
                    : allArticles
                }
                query={query}
              />
            )}
            {dashboardSection === 'dashboardSectionSettings' && (
              <DashboardSettingsSection />
            )}
            {dashboardSection === 'dashboardSectionHelpCenter' && (
              <DashboardHelpCenterSection />
            )}
            {openCreateFolderModal && (
              <>
                <Backdrop />
                <DashboardCreateFolderModal
                  handleCloseCreateFolderModal={handleCloseCreateFolderModal}
                  collectionFolderAncestors={collectionFolderAncestors}
                  allFolders={allFolders}
                  allBookmarks={allBookmarks}
                />
              </>
            )}
            {openRenameFolderModal && (
              <>
                <Backdrop />
                <DashboardRenameModal
                  handleCloseRenameModal={handleCloseRenameModal}
                  folderIdToRename={folderIdToRename}
                  collectionFolderAncestors={collectionFolderAncestors}
                  allFolders={allFolders}
                />
              </>
            )}
            {openDeleteModal && (
              <>
                <Backdrop />
                <DashboardSectionDeleteModal
                  handleCloseDeleteModal={handleCloseDeleteModal}
                  deleteDetails={deleteDetails}
                />
              </>
            )}
            {dashboardGenericDelete?.id && (
              <>
                <Backdrop />
                <DashboardGenericDelete
                  dashboardGenericDelete={dashboardGenericDelete}
                  handleCloseGenericDeleteModal={handleCloseGenericDeleteModal}
                />
              </>
            )}
            {dashboardGenericNoFolderDelete?.id && (
              <>
                <Backdrop />
                <DashboardGenericDelete
                  dashboardGenericDelete={dashboardGenericNoFolderDelete}
                  handleCloseGenericDeleteModal={
                    handleCloseGenericNoFolderDeleteModal
                  }
                />
              </>
            )}
            {activationNeeded && (
              <>
                <Backdrop />
                <PaymentModal
                  setActivationNeeded={setActivationNeeded}
                  info={paymentModalInfo}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
