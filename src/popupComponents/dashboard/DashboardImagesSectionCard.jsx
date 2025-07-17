import React, { useRef, useState } from 'react'
import '../dashboard/DashboardSection.css'
import {
  downloadDashboardFile,
  handleDashboardImageDetailSettings,
  viewDashboardFile,
} from '../../utils/dashboardUtility'
import { ImageWithFallback } from '../../utils/utility'

export default function DashboardImagesSectionCard({
  allImages,
  existingDashboardImageDetail,
  handleDashboardGenericDelete,
  handleDashboardGenericNoFolderDelete,
  searchImagesResults,
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
      {existingDashboardImageDetail?.isHome && (
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
          {Array.isArray(searchImagesResults) &&
            searchImagesResults.length > 0 &&
            searchImagesResults.map((image) => (
              <div
                key={`${image.imageFolderName}-${image.id}`}
                className="dashboardImagesSectionDefault"
              >
                <div
                  className="dashboardImagesSectionDefaultContent"
                  onClick={() =>
                    handleDashboardImageDetailSettings(
                      image.imageFolderName,
                      image.imageUrl,
                      false,
                      image.id,
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
                    {image.imageFolderName}
                  </span>
                  <span className="dashboardSectionImagesFolderCount">
                    {JSON.parse(image.imageUrl).length}
                  </span>
                </div>
                <img
                  src="images/popup/dashboardEllipses.svg"
                  alt="icon"
                  className="dashboardSectionCollectionFolderOptionImg"
                  onMouseEnter={() =>
                    handleShowActionOverlay(image.imageFolderName, image.id)
                  }
                  onMouseLeave={handleHideActionOverlay}
                />
                {modal === `${image.imageFolderName}-${image.id}` && (
                  <div
                    className="dashboardDeleteModal"
                    onMouseEnter={() =>
                      handleShowActionOverlay(image.imageFolderName, image.id)
                    }
                    onMouseLeave={handleHideActionOverlay}
                  >
                    <div
                      className="dashboardDeleteModalContent"
                      onClick={() =>
                        handleDashboardGenericDelete(
                          image.imageFolderName,
                          image.id,
                          true,
                          true,
                          false,
                          false,
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
      {!existingDashboardImageDetail?.isHome && (
        <div
          className="dashboardSectionImageDetailContainer"
          style={{
            marginTop: '-10px',
          }}
        >
          {(() => {
            const imageUrl =
              query && searchImagesResults?.imageUrl
                ? searchImagesResults?.imageUrl
                : existingDashboardImageDetail?.imageUrl
            try {
              const parsedImageUrl = imageUrl ? JSON.parse(imageUrl) : []
              if (Array.isArray(parsedImageUrl) && parsedImageUrl.length > 0) {
                return parsedImageUrl.map((data, index) => (
                  <div
                    key={`${data.name}-${index}`}
                    className="dashboardSectionImageDetailContent"
                  >
                    <ImageWithFallback
                      src={data.url}
                      alt={data.name}
                      styleString="dashboardSectionImageDetailContentImg"
                      fallbackSrc="icons/icon48.png"
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
                            existingDashboardImageDetail?.id,
                            false,
                            false,
                            true,
                            false,
                            false,
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
              console.error('Invalid JSON in imageUrl:', error)
            }
            return null
          })()}
        </div>
      )}
    </>
  )
}
