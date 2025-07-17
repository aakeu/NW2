import React, { useRef, useState } from 'react'
import '../dashboard/DashboardSection.css'
import DashboardSectionBookmarkDeleteModal from './DashboardSectionBookmarkDeleteModal'
import { openLink } from '../../utils/utility'

export default function DashboardSectionBookmarkComp({
  handleOpenDeleteModal,
  allBookmarks,
  dashboardCollectionFolderBookmarks,
  isChecked,
  isFolder,
  isBookmark,
  isFavorite,
  selectedBookmarkParentName,
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
            className="dashboardSectionBookmarkContainer"
          >
            <div
              className="dashboardSectionBookmarkDetailsHolder"
              onClick={() => openLink(data.url, isChecked)}
            >
              <img
                src={data.imgUrl}
                className="dashboardSectionBookmarkDetailsImg"
                alt={data.title}
              />
              <span className="dashboardSectionBookmarkDetailsText">
                {data.title}
              </span>
              <div className="dashboardBookmarkSource">{data.source}</div>
            </div>
            <img
              src="images/popup/dashboardEllipses.svg"
              alt="icon"
              className="dashboardSectionBookmarkImg"
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
