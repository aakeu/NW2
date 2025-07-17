import React from 'react'
import DashboardSectionFolderComp from './DashboardSectionFolderComp'
import DashboardSectionBookmarkComp from './DashboardSectionBookmarkComp'
import DashboardSectionListComp from './DashboardSectionListComp'
import DashboardSectionBookmarkListComp from './DashboardSectionBookmarkListComp'
import DashboardSectionBreadcrumb from './DashboardSectionBreadcrumb'

export default function DashboardCollectionSection({
  handleOpenRenameModal,
  handleOpenDeleteModal,
  dashboardSectionCardListDisplay,
  dashboardCollectionFolders,
  dashboardCollectionFolderAncestors,
  allFolders,
  allBookmarks,
  dashboardCollectionFolderBookmarks,
  isChecked,
  selectedBookmarkParentName,
  setQuery,
}) {
  return (
    <>
      <DashboardSectionBreadcrumb
        dashboardCollectionFolderAncestors={dashboardCollectionFolderAncestors}
        allFolders={allFolders}
        allBookmarks={allBookmarks}
      />
      {dashboardSectionCardListDisplay === 'dashboardSectionCardDisplay' && (
        <div className="dashboardSectionCollectionContainer">
          <DashboardSectionFolderComp
            handleOpenRenameModal={handleOpenRenameModal}
            handleOpenDeleteModal={handleOpenDeleteModal}
            dashboardCollectionFolders={dashboardCollectionFolders}
            allFolders={allFolders}
            allBookmarks={allBookmarks}
            isFolder={true}
            isBookmark={false}
            isFavorite={false}
            setQuery={setQuery}
          />

          <DashboardSectionBookmarkComp
            handleOpenDeleteModal={handleOpenDeleteModal}
            allBookmarks={allBookmarks}
            dashboardCollectionFolderBookmarks={
              dashboardCollectionFolderBookmarks
            }
            isChecked={isChecked}
            isFolder={false}
            isBookmark={true}
            isFavorite={false}
            selectedBookmarkParentName={selectedBookmarkParentName}
          />
        </div>
      )}
      {dashboardSectionCardListDisplay === 'dashboardSectionListDisplay' && (
        <div className="dashboardSectionCollectionListContainer">
          <DashboardSectionListComp
            handleOpenRenameModal={handleOpenRenameModal}
            handleOpenDeleteModal={handleOpenDeleteModal}
            dashboardCollectionFolders={dashboardCollectionFolders}
            allFolders={allFolders}
            allBookmarks={allBookmarks}
            isFolder={true}
            isBookmark={false}
            isFavorite={false}
            setQuery={setQuery}
          />
          <DashboardSectionBookmarkListComp
            handleOpenDeleteModal={handleOpenDeleteModal}
            allBookmarks={allBookmarks}
            dashboardCollectionFolderBookmarks={
              dashboardCollectionFolderBookmarks
            }
            isChecked={isChecked}
            isFolder={false}
            isBookmark={true}
            isFavorite={false}
            selectedBookmarkParentName={selectedBookmarkParentName}
          />
        </div>
      )}
    </>
  )
}
