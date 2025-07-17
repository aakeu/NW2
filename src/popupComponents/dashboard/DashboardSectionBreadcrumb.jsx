import React from 'react'
import '../dashboard/DashboardSection.css'
import { handleFolderClick } from '../../utils/dashboardUtility'

export default function DashboardSectionBreadcrumb({
  dashboardCollectionFolderAncestors,
  allFolders,
  allBookmarks
}) {
  return (
    <div className="dashboardBreadcrumbContainer">
      {Array.isArray(dashboardCollectionFolderAncestors) &&
        dashboardCollectionFolderAncestors.length > 0 &&
        dashboardCollectionFolderAncestors.map((data, index) => (
          <div key={`${data}-${index}`} className="dashboardSectionBreadcrumb">
            {data === '/' ? (
              <img
                src="images/popup/home.svg"
                className="dashboardSectionBreadcrumbImg"
                alt="home"
                onClick={() => handleFolderClick(data, allFolders, allBookmarks)}
              />
            ) : (
              <span
                className="dashboardSectionBreadcrumbTextHolder"
                onClick={() => handleFolderClick(data, allFolders, allBookmarks)}
              >
                {data}
              </span>
            )}
            {index < dashboardCollectionFolderAncestors.length - 1 && (
              <img
                src="images/popup/greaterThan.svg"
                className="dashboardSectionBreadcrumbGreater"
                alt="greater than"
              />
            )}
          </div>
        ))}
    </div>
  )
}
