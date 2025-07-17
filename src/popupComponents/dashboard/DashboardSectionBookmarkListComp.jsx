import React, { useRef, useState } from 'react'
import '../dashboard/DashboardSection.css'
import DashboardSectionBookmarkDeleteModal from './DashboardSectionBookmarkDeleteModal'
import { openLink } from '../../utils/utility'

export default function DashboardSectionBookmarkListComp({
  handleOpenDeleteModal,
  allBookmarks,
  dashboardCollectionFolderBookmarks,
  isChecked,
  isFolder,
  isBookmark,
  isFavorite,
  selectedBookmarkParentName
}) {
  const [modal, setModal] = useState(null)
  const hideDashboardBookmarkDeleteRef = useRef(null)

  const handleShowDashboardBookmarkDelete = async (title, id) => {
    if (hideDashboardBookmarkDeleteRef.current) {
      clearTimeout(hideDashboardBookmarkDeleteRef.current)
    }
    setModal(`${title}-${id}`)
  }

  const handleHideDashboardBookmarkDelete = async () => {
    hideDashboardBookmarkDeleteRef.current = setTimeout(() => {
      setModal(null)
    }, 200)
  }
  return (
    <>
      {Array.isArray(dashboardCollectionFolderBookmarks) &&
        dashboardCollectionFolderBookmarks.length > 0 &&
        dashboardCollectionFolderBookmarks.map((data) => (
          <div
            key={`${data.title}-${data.id}`}
            className="dashboardSectionBookmarkListContainer"
          >
            <div
              className="dashboardSectionBookmarkListDetailHolder"
              onClick={() => openLink(data.url, isChecked)}
            >
              <img
                src={data.imgUrl}
                className="dashboardSectionBookmarkListDetailImg"
                alt="icon"
              />
              <div className="dashboardSectionBookmarkListDetailContent">
                <span className="dashboardSectionBookmarkListDetailContentText">
                  {data.title}
                </span>
                <span className="dashboardSectionBookmarkListDetailContentUrl">
                  {data.url.length > 50
                    ? data.url.slice(0, 50) + '...'
                    : data.url}
                </span>
              </div>
              <div className="dashboardBookmarkListSource">{data.source}</div>
            </div>
            <img
              src="images/popup/dashboardEllipses.svg"
              alt="icon"
              className="dashboardSectionBookmarkListImg"
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
        ))}
    </>
  )
}
