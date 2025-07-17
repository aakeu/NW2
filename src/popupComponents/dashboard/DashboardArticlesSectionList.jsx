import React, { useRef, useState } from 'react'
import '../dashboard/DashboardSection.css'
import {
  downloadDashboardFile,
  handleDashboardArticleDetailSettings,
  viewDashboardFile,
} from '../../utils/dashboardUtility'
import { ImageWithFallback } from '../../utils/utility'

export default function DashboardArticlesSectionList({
  allArticles,
  existingDashboardArticleDetail,
  handleDashboardGenericDelete,
  handleDashboardGenericNoFolderDelete,
  searchArticlesResults,
  query,
}) {
  const [modal, setModal] = useState(null)
  const [modalList, setModalList] = useState(null)
  const hideActionOverlayRef = useRef(null)
  const hideActionOverlayListRef = useRef(null)

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
  const handleShowActionOverlayList = async (title, id) => {
    if (hideActionOverlayListRef.current) {
      clearTimeout(hideActionOverlayListRef.current)
    }
    setModalList(`${title}-${id}`)
  }

  const handleHideActionOverlayList = async () => {
    hideActionOverlayListRef.current = setTimeout(() => {
      setModalList(null)
    }, 200)
  }
  return (
    <>
      {existingDashboardArticleDetail?.isHome && (
        <>
          <div className="dashboardImagesSectionDefaultList">
            <div className="dashboardImagesSectionDefaultContentList">
              <div className="dashboardSectionImagesFolderIconHolderList">
                <img
                  src="images/popup/collectionFolderIcon.svg"
                  alt="icon"
                  className="dashboardSectionImagesFolderIconImgList"
                />
              </div>
              <div className="dashboardImagesSectionDefaultContentListDetail">
                <span className="dashboardSectionImagesFolderNameList">
                  Default Uploads
                </span>
                <span className="dashboardSectionImagesFolderCountList">
                  23
                </span>
              </div>
            </div>
            {/* <img
              src="images/dashboardEllipses.svg"
              alt="icon"
              className="dashboardSectionCollectionFolderOptionImgList"
            /> */}
          </div>
          {Array.isArray(searchArticlesResults) &&
            searchArticlesResults.length > 0 &&
            searchArticlesResults.map((article) => (
              <div
                key={`${article.articleFolderName}-${article.id}`}
                className="dashboardImagesSectionDefaultList"
              >
                <div
                  className="dashboardImagesSectionDefaultContentList"
                  onClick={() =>
                    handleDashboardArticleDetailSettings(
                      article.articleFolderName,
                      article.articleUrl,
                      false,
                      article.id,
                    )
                  }
                >
                  <div className="dashboardSectionImagesFolderIconHolderList">
                    <img
                      src="images/popup/collectionFolderIcon.svg"
                      alt="icon"
                      className="dashboardSectionImagesFolderIconImgList"
                    />
                  </div>
                  <div className="dashboardImagesSectionDefaultContentListDetail">
                    <span className="dashboardSectionImagesFolderNameList">
                      {article.articleFolderName}
                    </span>
                    <span className="dashboardSectionImagesFolderCountList">
                      {JSON.parse(article.articleUrl).length}
                    </span>
                  </div>
                </div>
                <img
                  src="images/popup/dashboardEllipses.svg"
                  alt="icon"
                  className="dashboardSectionCollectionFolderOptionImgList"
                  onMouseEnter={() =>
                    handleShowActionOverlayList(
                      article.articleFolderName,
                      article.id,
                    )
                  }
                  onMouseLeave={handleHideActionOverlayList}
                />
                {modalList === `${article.articleFolderName}-${article.id}` && (
                  <div
                    className="dashboardDeleteModal"
                    onMouseEnter={() =>
                      handleShowActionOverlayList(
                        article.articleFolderName,
                        article.id,
                      )
                    }
                    onMouseLeave={handleHideActionOverlayList}
                    style={{
                      marginTop: '-20px',
                    }}
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
          className="dashboardSectionImageDetailContainerList"
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
                    className="dashboardSectionImageDetailContentList"
                  >
                    <ImageWithFallback
                      src={data.url}
                      alt={data.name}
                      styleString="dashboardSectionImageDetailContentListImg"
                      fallbackSrc="images/popup/pdfthumb.png"
                    />
                    <span className="dashboardSectionImageDetailContentListName">
                      {data.name.length > 13
                        ? data.name.slice(0, 13) + '...'
                        : data.name}
                    </span>
                    <img
                      src="images/popup/dashboardEllipses.svg"
                      alt="icon"
                      className="dashboardSectionFavoriteCardImg"
                      onMouseEnter={() =>
                        handleShowActionOverlay(data.name, index)
                      }
                      onMouseLeave={handleHideActionOverlay}
                    />
                    {modal === `${data.name}-${index}` && (
                      <div
                        className="dashboardListOverlay"
                        onMouseEnter={() =>
                          handleShowActionOverlay(data.name, index)
                        }
                        onMouseLeave={handleHideActionOverlay}
                      >
                        <div className="dashboardListOverlayContent">
                          <div
                            className="dashboardListOverlayContentView"
                            onClick={() => viewDashboardFile(data.url)}
                          >
                            <img
                              src="images/popup/listView.svg"
                              alt="listView"
                              className="dashboardListOverlayListImg"
                            />
                            View
                          </div>
                          <div
                            className="dashboardListOverlayContentDownload"
                            onClick={() => downloadDashboardFile(data.url)}
                          >
                            <img
                              src="images/popup/listDownload.svg"
                              alt="listDownload"
                              className="dashboardListOverlayListImg"
                            />
                            Download
                          </div>
                          <div
                            className="dashboardListOverlayContentDelete"
                            style={{
                              marginTop: '5px',
                            }}
                            onClick={() =>
                              handleDashboardGenericNoFolderDelete(
                                data.name,
                                existingDashboardArticleDetail.id,
                                false,
                                false,
                                false,
                                false,
                                false,
                                false,
                                true,
                              )
                            }
                          >
                            <img
                              src="images/popup/listDelete.svg"
                              alt="listDelete"
                              className="dashboardListOverlayListImg"
                            />
                            Delete
                          </div>
                        </div>
                      </div>
                    )}
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
