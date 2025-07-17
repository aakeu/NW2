import React, { useRef, useState } from 'react'
import '../dashboard/DashboardSection.css'
import DashboardSectionRenameDeleteModal from './dashboardSectionRenameDeleteModal'
import { handleFolderClick } from '../../utils/dashboardUtility'

export default function DashboardSectionListComp({
  handleOpenRenameModal,
  handleOpenDeleteModal,
  dashboardCollectionFolders,
  allFolders,
  allBookmarks,
  isFolder,
  isBookmark,
  isFavorite,
  setQuery,
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
            className="dashboardSectionCollectionListDetailHolder"
          >
            <div
              className="dashboardSectionCollectionListFolderIconHolder"
              onClick={() => {
                handleFolderClick(data.name, allFolders, allBookmarks)
                setQuery('')
              }}
            >
              <img
                src="images/popup/folder.svg"
                alt="icon"
                className="dashboardSectionCollectionListFolderIconImg"
              />
              <div className="dashboardSectionCollectionListFolderIconHolderContent">
                <span className="dashboardSectionCollectionListFolderText">
                  {data.name}
                </span>
                <span className="dashboardSectionCollectionListFolderCount">
                  {`${
                    Array.isArray(allFolders) &&
                    allFolders.length > 0 &&
                    allFolders.filter(
                      (folder) => folder.parentFolder === data.name,
                    )?.length
                  } folders`}
                </span>
                <span className="dashboardSectionCollectionListFolderCount">
                  {`${
                    Array.isArray(allBookmarks) &&
                    allBookmarks.length > 0 &&
                    allBookmarks.filter(
                      (bookmark) => bookmark.folderName === data.name,
                    )?.length
                  } bookmarks`}
                </span>
              </div>
            </div>
            <div className="dashboardSectionCollectionListDetailImgHolder">
              <img
                src="images/popup/dashboardEllipses.svg"
                alt="icon"
                className="dashboardSectionCollectionListDetailImg"
                onMouseEnter={() => handleShowDeleteRename(data.name, data.id)}
                onMouseLeave={handleHideDeleteRename}
              />
            </div>
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
