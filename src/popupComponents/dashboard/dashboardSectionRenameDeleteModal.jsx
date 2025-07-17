import React from 'react'
import '../dashboard/DashboardSection.css'

export default function DashboardSectionRenameDeleteModal({
  handleShowDeleteRename,
  handleHideDeleteRename,
  handleOpenRenameModal,
  handleOpenDeleteModal,
  name,
  id,
  isFolder,
  isBookmark,
  isFavorite,
}) {
  return (
    <div
      className="dashboardSectionFolderRenameDeleteModal"
      onMouseEnter={() => handleShowDeleteRename(name, id)}
      onMouseLeave={handleHideDeleteRename}
    >
      <div className="dashboardSectionFolderRenameDeleteModalContent">
        <div
          className="dashboardSectionFolderRenameDeleteModalRename"
          onClick={() => handleOpenRenameModal(id)}
        >
          <img
            src="images/popup/renameIcon.svg"
            alt="icon"
            className="renameIconImg"
          />
          Rename
        </div>
        <div
          className="dashboardSectionFolderRenameDeleteModalDelete"
          onClick={() =>
            handleOpenDeleteModal(id, name, isFolder, isBookmark, isFavorite)
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
    </div>
  )
}
