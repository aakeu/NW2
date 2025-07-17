import React, { useRef, useState } from 'react'
import '../dashboard/DashboardSection.css'
import DashboardSectionBookmarkDeleteModal from './DashboardSectionBookmarkDeleteModal'
import { ImageWithFallback, openLink } from '../../utils/utility'

export default function DashboardSectionFavoriteCard({
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
            className="dashboardSectionFavoriteCard"
          >
            <div
              className="dashboardSectionFavoriteCardDetailsHolder"
              onClick={() => openLink(data.url, isChecked)}
            >
              <ImageWithFallback
                src={data.imgUrl}
                alt={data.title}
                styleString="dashboardSectionFavoriteCardDetailsImg"
                fallbackSrc="icons/icon48.png"
              />
              <span className="dashboardSectionFavoriteCardDetailsText">
                {data.title.length > 17
                  ? data.title.slice(0, 17) + '...'
                  : data.title}
              </span>
              <span className="dashboardSectionFavoriteCardDetailContentUrl">
                {data.url.length > 17
                  ? data.url.slice(0, 17) + '...'
                  : data.url}
              </span>
              <div className="dashboardSectionFavoriteSource">F</div>
            </div>
            <img
              src="images/popup/dashboardEllipses.svg"
              alt="icon"
              className="dashboardSectionFavoriteCardImg"
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
        <div className="dashboardSectionFavoriteCardNoData">
          You have no favorites yet
        </div>
      )}
    </>
  )
}
