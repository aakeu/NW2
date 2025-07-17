import React, { useEffect, useRef, useState } from 'react'
import '../dashboard/DashboardSection.css'
import DashboardSectionRenameDeleteModal from './dashboardSectionRenameDeleteModal'
import { handleFolderClick } from '../../utils/dashboardUtility'

export default function DashboardSectionFolderComp({
  handleOpenRenameModal,
  handleOpenDeleteModal,
  dashboardCollectionFolders,
  allFolders,
  allBookmarks,
  isFolder,
  isBookmark,
  isFavorite,
  setQuery
}) {
  const [modal, setModal] = useState(null)
  const hideDeleteRenameRef = useRef(null)

  const handleShowDeleteRename = async (name, id) => {
    if (hideDeleteRenameRef.current) {
      clearTimeout(hideDeleteRenameRef.current)
    }
    setModal(`${name}-${id}`)
  }

  const handleHideDeleteRename = async () => {
    hideDeleteRenameRef.current = setTimeout(() => {
      setModal(null)
    }, 200)
  }

  return (
    <>
      {Array.isArray(dashboardCollectionFolders) &&
        dashboardCollectionFolders.length > 0 &&
        dashboardCollectionFolders.map((data) => (
          <div
            key={`${data.name}-${data.id}`}
            className="dashboardSectionCollectionFolderContainer"
          >
            <div
              className="dashboardSectionCollectionFolderDetailHolder"
              onClick={() => {
                handleFolderClick(data.name, allFolders, allBookmarks)
                setQuery("")
              }}
            >
              <div className="dashboardSectionCollectionFolderIconHolder">
                <img
                  src="images/popup/collectionFolderIcon.svg"
                  alt="icon"
                  className="dashboardSectionCollectionFolderIconImg"
                />
              </div>
              <span className="dashboardSectionCollectionFolderName">
                {data.name}
              </span>
              <span className="dashboardSectionCollectionFolderCount">
                {`${
                  Array.isArray(allFolders) &&
                  allFolders.length > 0 &&
                  allFolders.filter(
                    (folder) => folder.parentFolder === data.name,
                  )?.length
                } folders`}
              </span>
              <span className="dashboardSectionCollectionFolderCount">
                {`${
                  Array.isArray(allBookmarks) &&
                  allBookmarks.length > 0 &&
                  allBookmarks.filter(
                    (bookmark) => bookmark.folderName === data.name,
                  )?.length
                } bookmarks`}
              </span>
            </div>
            <img
              src="images/popup/dashboardEllipses.svg"
              alt="icon"
              className="dashboardSectionCollectionFolderOptionImg"
              onMouseEnter={() => handleShowDeleteRename(data.name, data.id)}
              onMouseLeave={handleHideDeleteRename}
            />
            {modal === `${data.name}-${data.id}` && (
              <DashboardSectionRenameDeleteModal
                handleShowDeleteRename={handleShowDeleteRename}
                handleHideDeleteRename={handleHideDeleteRename}
                handleOpenRenameModal={handleOpenRenameModal}
                handleOpenDeleteModal={handleOpenDeleteModal}
                name={data.name}
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
