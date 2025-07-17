import React from 'react'
import DashboardSectionFavoriteCard from './DashboardSectionFavoriteCard'
import DashboardSectionFavoriteList from './DashboardSectionFavoriteList'

export default function DashboardFavoritesSection({
  handleOpenDeleteModal,
  allFavorites,
  isChecked,
  dashboardSectionCardListDisplay,
  searchFavoriteResults
}) {
  return (
    <>
      {dashboardSectionCardListDisplay === 'dashboardSectionCardDisplay' && (
        <div className="dashboardFavoritesCardContainer">
          <DashboardSectionFavoriteCard
            handleOpenDeleteModal={handleOpenDeleteModal}
            allFavorites={allFavorites}
            isChecked={isChecked}
            isFolder={false}
            isBookmark={false}
            isFavorite={true}
            searchFavoriteResults={searchFavoriteResults}
          />
        </div>
      )}
      {dashboardSectionCardListDisplay === 'dashboardSectionListDisplay' && (
        <div className="dashboardFavoritesListContainer">
          <DashboardSectionFavoriteList
            handleOpenDeleteModal={handleOpenDeleteModal}
            allFavorites={allFavorites}
            isChecked={isChecked}
            isFolder={false}
            isBookmark={false}
            isFavorite={true}
            searchFavoriteResults={searchFavoriteResults}
          />
        </div>
      )}
    </>
  )
}
