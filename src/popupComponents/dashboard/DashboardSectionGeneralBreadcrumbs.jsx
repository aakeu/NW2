import React from 'react'
import '../dashboard/DashboardSection.css'
import {
  handleDashboardArticleDetailSettings,
  handleDashboardImageDetailSettings,
  handleDashboardVideoDetailSettings,
} from '../../utils/dashboardUtility'

export default function DashboardSectionGeneralBreadcrumb({
  existingDashboardGenericDetail,
  section,
}) {
  return (
    <div className="dashboardSectionGeneralBreadcrumb">
      <img
        src="images/popup/home.svg"
        className="dashboardSectionBreadcrumbImg"
        alt="home"
        onClick={
          section === 'image'
            ? () => handleDashboardImageDetailSettings(null, null, true, null)
            : section === 'article'
            ? () => handleDashboardArticleDetailSettings(null, null, true, null)
            : section === 'video'
            ? () => handleDashboardVideoDetailSettings(null, null, true, null)
            : null
        }
      />
      {!existingDashboardGenericDetail?.isHome && (
        <>
          <img
            src="images/popup/greaterThan.svg"
            className="dashboardSectionBreadcrumbGreater"
            alt="greater than"
          />
          <span
            className="dashboardSectionBreadcrumbTextHolder"
            style={{
              marginLeft: '-3px',
            }}
          >
            {section === 'image' &&
              existingDashboardGenericDetail?.imageFolderName}
            {section === 'article' &&
              existingDashboardGenericDetail?.articleFolderName}
            {section === 'video' &&
              existingDashboardGenericDetail?.videoFolderName}
          </span>
        </>
      )}
    </div>
  )
}
