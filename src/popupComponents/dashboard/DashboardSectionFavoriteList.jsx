import React, { useRef, useState } from 'react'
import '../dashboard/DashboardSection.css'
import DashboardSectionBookmarkDeleteModal from './DashboardSectionBookmarkDeleteModal'
import { ImageWithFallback, openLink } from '../../utils/utility'

export default function DashboardSectionFavoriteList({
  handleOpenDeleteModal,
  allFavorites,
  isChecked,
  isFolder,
  isBookmark,
  isFavorite,
  searchFavoriteResults,
}) {
  const [modal, setModal] = useState(null)
  const hideDashboardFavoriteDeleteRef = useRef(null)

  const handleShowDashboardBookmarkDelete = async (title, id) => {
    if (hideDashboardFavoriteDeleteRef.current) {
      clearTimeout(hideDashboardFavoriteDeleteRef.current)
    }
    setModal(`${title}-${id}`)
  }

  const handleHideDashboardBookmarkDelete = async () => {
    hideDashboardFavoriteDeleteRef.current = setTimeout(() => {
      setModal(null)
    }, 200)
  }
  return (
    <>
      {Array.isArray(searchFavoriteResults) &&
      searchFavoriteResults.length > 0 ? (
        searchFavoriteResults.map((data) => (
          <div
            key={`${data.title}-${data.id}`}
            className="dashboardSectionFavoriteListContainer"
          >
            <div
              className="dashboardSectionFavoriteListDetailHolder"
              onClick={() => openLink(data.url, isChecked)}
            >
              <ImageWithFallback
                src={data.imgUrl}
                alt={data.title}
                styleString="dashboardSectionFavoriteListDetailImg"
                fallbackSrc="icons/icon48.png"
              />
              <div className="dashboardSectionFavoriteListDetailContent">
                <span className="dashboardSectionFavoriteListDetailContentText">
                  {data.title}
                </span>
                <span className="dashboardSectionFavoriteListDetailContentUrl">
                  {data.url.length > 50
                    ? data.url.slice(0, 50) + '...'
                    : data.url}
                </span>
              </div>
              <div className="dashboardFavoriteListSource">F</div>
            </div>
            <img
              src="images/popup/dashboardEllipses.svg"
              alt="icon"
              className="dashboardSectionFavoriteListImg"
              onMouseEnter={() =>
                handleShowDashboardBookmarkDelete(data.title, data.id)
              }
              onMouseLeave={handleHideDashboardBookmarkDelete}
            />
            {modal === `${data.title}-${data.id}` && (
              <DashboardSectionBookmarkDeleteModal
                handleShowDashboardBookmarkDelete={
                  handleShowDashboardBookmarkDelete
                }
                handleHideDashboardBookmarkDelete={
                  handleHideDashboardBookmarkDelete
                }
                handleOpenDeleteModal={handleOpenDeleteModal}
                title={data.title}
                id={data.id}
                isFolder={isFolder}
                isBookmark={isBookmark}
                isFavorite={isFavorite}
              />
            )}
          </div>
        ))
      ) : (
        <div className="dashboardSectionFavoriteListNoData">
          You have no favorites yet
        </div>
      )}
    </>
  )
}
