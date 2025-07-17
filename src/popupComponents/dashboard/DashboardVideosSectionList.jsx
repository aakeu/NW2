import React, { useRef, useState } from 'react'
import '../dashboard/DashboardSection.css'
import {
  downloadDashboardFile,
  handleDashboardVideoDetailSettings,
  viewDashboardFile,
} from '../../utils/dashboardUtility'
import { ImageWithFallback } from '../../utils/utility'

export default function DashboardVideosSectionList({
  allVideos,
  existingDashboardVideoDetail,
  handleDashboardGenericDelete,
  handleDashboardGenericNoFolderDelete,
  searchVideosResults,
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
      {existingDashboardVideoDetail?.isHome && (
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
          {Array.isArray(searchVideosResults) &&
            searchVideosResults.length > 0 &&
            searchVideosResults.map((video) => (
              <div
                key={`${video.videoFolderName}-${video.id}`}
                className="dashboardImagesSectionDefaultList"
              >
                <div
                  className="dashboardImagesSectionDefaultContentList"
                  onClick={() =>
                    handleDashboardVideoDetailSettings(
                      video.videoFolderName,
                      video.videoUrl,
                      false,
                      video.id,
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
                      {video.videoFolderName}
                    </span>
                    <span className="dashboardSectionImagesFolderCountList">
                      {JSON.parse(video.videoUrl).length}
                    </span>
                  </div>
                </div>
                <img
                  src="images/popup/dashboardEllipses.svg"
                  alt="icon"
                  className="dashboardSectionCollectionFolderOptionImgList"
                  onMouseEnter={() =>
                    handleShowActionOverlayList(video.videoFolderName, video.id)
                  }
                  onMouseLeave={handleHideActionOverlayList}
                />
                {modalList === `${video.videoFolderName}-${video.id}` && (
                  <div
                    className="dashboardDeleteModal"
                    onMouseEnter={() =>
                      handleShowActionOverlayList(
                        video.videoFolderName,
                        video.id,
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
                          video.videoFolderName,
                          video.id,
                          true,
                          false,
                          false,
                          true,
                          false,
                          false,
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
      {!existingDashboardVideoDetail?.isHome && (
        <div
          className="dashboardSectionImageDetailContainerList"
          style={{
            marginTop: '-10px',
          }}
        >
          {(() => {
            const videoUrl =
              query && searchVideosResults?.videoUrl
                ? searchVideosResults?.videoUrl
                : existingDashboardVideoDetail?.videoUrl
            try {
              const parsedVideoUrl = videoUrl ? JSON.parse(videoUrl) : []
              if (Array.isArray(parsedVideoUrl) && parsedVideoUrl.length > 0) {
                return parsedVideoUrl.map((data, index) => (
                  <div
                    key={`${data.name}-${index}`}
                    className="dashboardSectionImageDetailContentList"
                  >
                    <ImageWithFallback
                      src={data.url}
                      alt={data.name}
                      styleString="dashboardSectionImageDetailContentListImg"
                      fallbackSrc="images/youtube.png"
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
                                existingDashboardVideoDetail.id,
                                false,
                                false,
                                false,
                                false,
                                true,
                                false,
                                false,
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
              console.error('Invalid JSON in videoUrl:', error)
            }
            return null
          })()}
        </div>
      )}
    </>
  )
}
