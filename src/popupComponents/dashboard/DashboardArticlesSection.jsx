import React from 'react'
import '../dashboard/DashboardSection.css'
import DashboardArticlesSectionCard from './DashboardArticlesSectionCard'
import DashboardArticlesSectionList from './DashboardArticlesSectionList'
import DashboardSectionGeneralBreadcrumb from './DashboardSectionGeneralBreadcrumbs'

export default function DashboardArticlesSection({
  allArticles,
  dashboardSectionCardListDisplay,
  existingDashboardArticleDetail,
  handleDashboardGenericDelete,
  handleDashboardGenericNoFolderDelete,
  searchArticlesResults,
  query,
}) {
  return (
    <>
      <DashboardSectionGeneralBreadcrumb
        existingDashboardGenericDetail={existingDashboardArticleDetail}
        section="article"
      />
      {dashboardSectionCardListDisplay === 'dashboardSectionCardDisplay' && (
        <div className="dashboardImagesCardContainer">
          <DashboardArticlesSectionCard
            allArticles={allArticles}
            existingDashboardArticleDetail={existingDashboardArticleDetail}
            handleDashboardGenericDelete={handleDashboardGenericDelete}
            handleDashboardGenericNoFolderDelete={
              handleDashboardGenericNoFolderDelete
            }
            searchArticlesResults={searchArticlesResults}
            query={query}
          />
        </div>
      )}
      {dashboardSectionCardListDisplay === 'dashboardSectionListDisplay' && (
        <div className="dashboardImagesListContainer">
          <DashboardArticlesSectionList
            allArticles={allArticles}
            existingDashboardArticleDetail={existingDashboardArticleDetail}
            handleDashboardGenericDelete={handleDashboardGenericDelete}
            handleDashboardGenericNoFolderDelete={
              handleDashboardGenericNoFolderDelete
            }
            searchArticlesResults={searchArticlesResults}
            query={query}
          />
        </div>
      )}
    </>
  )
}
