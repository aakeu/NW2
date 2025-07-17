import React from 'react'
import DashboardSectionLinkCard from './DashboardSectionLinkCard'
import DashboardSectionLinkList from './DashboardSectionLinkList'

export default function DashboardLinksSection({
  handleOpenDeleteModal,
  allBookmarks,
  isChecked,
  dashboardSectionCardListDisplay,
  searchLinksResult
}) {
  return (
    <>
      {dashboardSectionCardListDisplay === 'dashboardSectionCardDisplay' && (
        <div className="dashboardFavoritesCardContainer">
          <DashboardSectionLinkCard
            handleOpenDeleteModal={handleOpenDeleteModal}
            allBookmarks={allBookmarks}
            isChecked={isChecked}
            isFolder={false}
            isBookmark={true}
            isFavorite={false}
            searchLinksResult={searchLinksResult}
          />
        </div>
      )}
      {dashboardSectionCardListDisplay === 'dashboardSectionListDisplay' && (
        <div className="dashboardFavoritesListContainer">
          <DashboardSectionLinkList
            handleOpenDeleteModal={handleOpenDeleteModal}
            allBookmarks={allBookmarks}
            isChecked={isChecked}
            isFolder={false}
            isBookmark={true}
            isFavorite={false}
            searchLinksResult={searchLinksResult}
          />
        </div>
      )}
    </>
  )
}
