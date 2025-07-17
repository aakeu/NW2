import React from 'react'
import DashboardImagesSectionCard from './DashboardImagesSectionCard'
import DashboardImagesSectionList from './DashboardImagesSectionList'
import DashboardSectionGeneralBreadcrumb from './DashboardSectionGeneralBreadcrumbs'

export default function DashboardImagesSection({
  allImages,
  dashboardSectionCardListDisplay,
  existingDashboardImageDetail,
  handleDashboardGenericDelete,
  handleDashboardGenericNoFolderDelete,
  searchImagesResults,
  query
}) {
  return (
    <>
      <DashboardSectionGeneralBreadcrumb
        existingDashboardGenericDetail={existingDashboardImageDetail}
        section="image"
      />
      {dashboardSectionCardListDisplay === 'dashboardSectionCardDisplay' && (
        <div className="dashboardImagesCardContainer">
          <DashboardImagesSectionCard
            allImages={allImages}
            existingDashboardImageDetail={existingDashboardImageDetail}
            handleDashboardGenericDelete={handleDashboardGenericDelete}
            handleDashboardGenericNoFolderDelete={handleDashboardGenericNoFolderDelete}
            searchImagesResults={searchImagesResults}
            query={query}
          />
        </div>
      )}
      {dashboardSectionCardListDisplay === 'dashboardSectionListDisplay' && (
        <div className="dashboardImagesListContainer">
          <DashboardImagesSectionList
            allImages={allImages}
            existingDashboardImageDetail={existingDashboardImageDetail}
            handleDashboardGenericDelete={handleDashboardGenericDelete}
            handleDashboardGenericNoFolderDelete={handleDashboardGenericNoFolderDelete}
            searchImagesResults={searchImagesResults}
            query={query}
          />
        </div>
      )}
    </>
  )
}
