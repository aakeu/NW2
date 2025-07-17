import React, { useRef, useState } from 'react'
import '../dashboard/DashboardSection.css'
import {
  downloadDashboardFile,
  handleDashboardArticleDetailSettings,
  viewDashboardFile,
} from '../../utils/dashboardUtility'
import { ImageWithFallback } from '../../utils/utility'

export default function DashboardArticlesSectionCard({
  allArticles,
  existingDashboardArticleDetail,
  handleDashboardGenericDelete,
  handleDashboardGenericNoFolderDelete,
  searchArticlesResults,
  query,
}) {
  const [modal, setModal] = useState(null)
  const hideActionOverlayRef = useRef(null)

  const handleShowActionOverlay = async (title, id) => {
    if (hideActionOverlayRef.current) {
      clearTimeout(hideActionOverlayRef.current)
    }
    setModal(`${title}-${id}`)
  }

  const handleHideActionOverlay = async () => {
    hideActionOverlayRef.current = setTimeout(() => {
      setModal(null)
    }, 200)
  }
  return (
    <>
      {existingDashboardArticleDetail?.isHome && (
        <>
          <div className="dashboardImagesSectionDefault">
            <div className="dashboardImagesSectionDefaultContent">
              <div className="dashboardSectionImagesFolderIconHolder">
                <img
                  src="images/popup/collectionFolderIcon.svg"
                  alt="icon"
                  className="dashboardSectionImagesFolderIconImg"
                />
              </div>
              <span className="dashboardSectionImagesFolderName">
                Default Uploads
              </span>
              <span className="dashboardSectionImagesFolderCount">23</span>
            </div>
            {/* <img
              src="images/dashboardEllipses.svg"
              alt="icon"
              className="dashboardSectionCollectionFolderOptionImg"
            /> */}
          </div>
          {Array.isArray(searchArticlesResults) &&
            searchArticlesResults.length > 0 &&
            searchArticlesResults.map((article) => (
              <div
                key={`${article.articleFolderName}-${article.id}`}
                className="dashboardImagesSectionDefault"
              >
                <div
                  className="dashboardImagesSectionDefaultContent"
                  onClick={() =>
                    handleDashboardArticleDetailSettings(
                      article.articleFolderName,
                      article.articleUrl,
                      false,
                      article.id,
                    )
                  }
                >
                  <div className="dashboardSectionImagesFolderIconHolder">
                    <img
                      src="images/popup/collectionFolderIcon.svg"
                      alt="icon"
                      className="dashboardSectionImagesFolderIconImg"
                    />
                  </div>
                  <span className="dashboardSectionImagesFolderName">
                    {article.articleFolderName}
                  </span>
                  <span className="dashboardSectionImagesFolderCount">
                    {JSON.parse(article.articleUrl).length}
                  </span>
                </div>
                <img
                  src="images/popup/dashboardEllipses.svg"
                  alt="icon"
                  className="dashboardSectionCollectionFolderOptionImg"
                  onMouseEnter={() =>
                    handleShowActionOverlay(
                      article.articleFolderName,
                      article.id,
                    )
                  }
                  onMouseLeave={handleHideActionOverlay}
                />
                {modal === `${article.articleFolderName}-${article.id}` && (
                  <div
                    className="dashboardDeleteModal"
                    onMouseEnter={() =>
                      handleShowActionOverlay(
                        article.articleFolderName,
                        article.id,
                      )
                    }
                    onMouseLeave={handleHideActionOverlay}
                  >
                    <div
                      className="dashboardDeleteModalContent"
                      onClick={() =>
                        handleDashboardGenericDelete(
                          article.articleFolderName,
                          article.id,
                          true,
                          false,
                          false,
                          false,
                          false,
                          true,
                          false,
                        )
                      }
                    >
                      <img
                        src="images/popup/folderDeleteIcon.svg"
                        alt="icon"
                        className="folderDeleteIconImg"
                      />
                      Delete
                    </div>
                  </div>
                )}
              </div>
            ))}
        </>
      )}
      {!existingDashboardArticleDetail?.isHome && (
        <div
          className="dashboardSectionImageDetailContainer"
          style={{
            marginTop: '-10px',
          }}
        >
          {(() => {
            const articleUrl =
              query && searchArticlesResults?.articleUrl
                ? searchArticlesResults?.articleUrl
                : existingDashboardArticleDetail?.articleUrl
            try {
              const parsedArticleUrl = articleUrl ? JSON.parse(articleUrl) : []
              if (
                Array.isArray(parsedArticleUrl) &&
                parsedArticleUrl.length > 0
              ) {
                return parsedArticleUrl.map((data, index) => (
                  <div
                    key={`${data.name}-${index}`}
                    className="dashboardSectionImageDetailContent"
                  >
                    <ImageWithFallback
                      src={data.url}
                      alt={data.name}
                      styleString="dashboardSectionImageDetailContentImg"
                      fallbackSrc="images/pdfthumb.png"
                    />
                    <span className="dashboardSectionImageDetailContentName">
                      {data.name.length > 13
                        ? data.name.slice(0, 13) + '...'
                        : data.name}
                    </span>
                    <div className="dashboardSectionImageDetailContentOverlay">
                      <img
                        src="images/view.svg"
                        alt="view"
                        className="dashboardImgView"
                        onClick={() => viewDashboardFile(data.url)}
                      />
                      <img
                        src="images/download.svg"
                        alt="download"
                        className="dashboardImgDownload"
                        onClick={() => downloadDashboardFile(data.url)}
                      />
                      <img
                        src="images/del.svg"
                        alt="delete"
                        className="dashboardImgDelete"
                        onClick={() =>
                          handleDashboardGenericNoFolderDelete(
                            data.name,
                            existingDashboardArticleDetail?.id,
                            false,
                            false,
                            false,
                            false,
                            false,
                            false,
                            true,
                          )
                        }
                      />
                    </div>
                  </div>
                ))
              }
            } catch (error) {
              console.error('Invalid JSON in articleUrl:', error)
            }
            return null
          })()}
        </div>
      )}
    </>
  )
}
