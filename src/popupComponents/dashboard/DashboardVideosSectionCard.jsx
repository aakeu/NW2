import React, { useRef, useState } from 'react'
import '../dashboard/DashboardSection.css'
import {
  downloadDashboardFile,
  handleDashboardVideoDetailSettings,
  viewDashboardFile,
} from '../../utils/dashboardUtility'
import { ImageWithFallback } from '../../utils/utility'

export default function DashboardVideosSectionCard({
  allVideos,
  existingDashboardVideoDetail,
  handleDashboardGenericDelete,
  handleDashboardGenericNoFolderDelete,
  searchVideosResults,
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
      {existingDashboardVideoDetail?.isHome && (
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
          {Array.isArray(searchVideosResults) &&
            searchVideosResults.length > 0 &&
            searchVideosResults.map((video) => (
              <div
                key={`${video.videoFolderName}-${video.id}`}
                className="dashboardImagesSectionDefault"
              >
                <div
                  className="dashboardImagesSectionDefaultContent"
                  onClick={() =>
                    handleDashboardVideoDetailSettings(
                      video.videoFolderName,
                      video.videoUrl,
                      false,
                      video.id,
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
                    {video.videoFolderName}
                  </span>
                  <span className="dashboardSectionImagesFolderCount">
                    {JSON.parse(video.videoUrl).length}
                  </span>
                </div>
                <img
                  src="images/popup/dashboardEllipses.svg"
                  alt="icon"
                  className="dashboardSectionCollectionFolderOptionImg"
                  onMouseEnter={() =>
                    handleShowActionOverlay(video.videoFolderName, video.id)
                  }
                  onMouseLeave={handleHideActionOverlay}
                />
                {modal === `${video.videoFolderName}-${video.id}` && (
                  <div
                    className="dashboardDeleteModal"
                    onMouseEnter={() =>
                      handleShowActionOverlay(video.videoFolderName, video.id)
                    }
                    onMouseLeave={handleHideActionOverlay}
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
          className="dashboardSectionImageDetailContainer"
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
                    className="dashboardSectionImageDetailContent"
                  >
                    <ImageWithFallback
                      src={data.url}
                      alt={data.name}
                      styleString="dashboardSectionImageDetailContentImg"
                      fallbackSrc="images/youtube.png"
                    />
                    <span className="dashboardSectionImageDetailContentName">
                      {data.name.length > 13
                        ? data.name.slice(0, 13) + '...'
                        : data.name}
                    </span>
                    <div className="dashboardSectionImageDetailContentOverlay">
                      <img
                        src="images/popup/view.svg"
                        alt="view"
                        className="dashboardImgView"
                        onClick={() => viewDashboardFile(data.url)}
                      />
                      <img
                        src="images/popup/download.svg"
                        alt="download"
                        className="dashboardImgDownload"
                        onClick={() => downloadDashboardFile(data.url)}
                      />
                      <img
                        src="images/popup/del.svg"
                        alt="delete"
                        className="dashboardImgDelete"
                        onClick={() =>
                          handleDashboardGenericNoFolderDelete(
                            data.name,
                            existingDashboardVideoDetail?.id,
                            false,
                            false,
                            false,
                            false,
                            true,
                            false,
                            false,
                          )
                        }
                      />
                    </div>
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
