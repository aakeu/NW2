import React from 'react'
import '../dashboard/DashboardSection.css'

export default function DashboardSectionBookmarkDeleteModal({
  handleShowDashboardBookmarkDelete,
  handleHideDashboardBookmarkDelete,
  handleOpenDeleteModal,
  title,
  id,
  isFolder,
  isBookmark,
  isFavorite,
}) {
  return (
    <div
      className="dashboardSectionBookmarkDeleteModal"
      onMouseEnter={() => handleShowDashboardBookmarkDelete(title, id)}
      onMouseLeave={handleHideDashboardBookmarkDelete}
    >
      <div
        className="dashboardSectionBookmarkDeleteModalContent"
        onClick={() =>
          handleOpenDeleteModal(id, title, isFolder, isBookmark, isFavorite)
        }
      >
        <img
          src="images/popup/folderDeleteIcon.svg"
          alt="icon"
          className="folderDeleteIconImg"
        />
        Delete
      </div>
    </div>
  )
}
