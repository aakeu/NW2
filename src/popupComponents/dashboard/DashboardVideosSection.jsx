import React from 'react'
import DashboardSectionGeneralBreadcrumb from './DashboardSectionGeneralBreadcrumbs'
import DashboardVideosSectionCard from './DashboardVideosSectionCard'
import DashboardVideosSectionList from './DashboardVideosSectionList'

export default function DashboardVideosSection({
  allVideos,
  dashboardSectionCardListDisplay,
  existingDashboardVideoDetail,
  handleDashboardGenericDelete,
  handleDashboardGenericNoFolderDelete,
  searchVideosResults,
  query,
}) {
  return (
    <>
      <DashboardSectionGeneralBreadcrumb
        existingDashboardGenericDetail={existingDashboardVideoDetail}
        section="video"
      />
      {dashboardSectionCardListDisplay === 'dashboardSectionCardDisplay' && (
        <div className="dashboardImagesCardContainer">
          <DashboardVideosSectionCard
            allVideos={allVideos}
            existingDashboardVideoDetail={existingDashboardVideoDetail}
            handleDashboardGenericDelete={handleDashboardGenericDelete}
            handleDashboardGenericNoFolderDelete={
              handleDashboardGenericNoFolderDelete
            }
            searchVideosResults={searchVideosResults}
            query={query}
          />
        </div>
      )}
      {dashboardSectionCardListDisplay === 'dashboardSectionListDisplay' && (
        <div className="dashboardImagesListContainer">
          <DashboardVideosSectionList
            allVideos={allVideos}
            existingDashboardVideoDetail={existingDashboardVideoDetail}
            handleDashboardGenericDelete={handleDashboardGenericDelete}
            handleDashboardGenericNoFolderDelete={
              handleDashboardGenericNoFolderDelete
            }
            searchVideosResults={searchVideosResults}
            query={query}
          />
        </div>
      )}
    </>
  )
}
