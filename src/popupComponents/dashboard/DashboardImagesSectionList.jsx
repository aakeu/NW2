import React, { useRef, useState } from 'react'
import '../dashboard/DashboardSection.css'
import {
  downloadDashboardFile,
  handleDashboardImageDetailSettings,
  viewDashboardFile,
} from '../../utils/dashboardUtility'
import { ImageWithFallback } from '../../utils/utility'

export default function DashboardImagesSectionList({
  allImages,
  existingDashboardImageDetail,
  handleDashboardGenericDelete,
  handleDashboardGenericNoFolderDelete,
  searchImagesResults,
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
      {existingDashboardImageDetail?.isHome && (
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
          {Array.isArray(searchImagesResults) &&
            searchImagesResults.length > 0 &&
            searchImagesResults.map((image) => (
              <div
                key={`${image.imageFolderName}-${image.id}`}
                className="dashboardImagesSectionDefaultList"
              >
                <div
                  className="dashboardImagesSectionDefaultContentList"
                  onClick={() =>
                    handleDashboardImageDetailSettings(
                      image.imageFolderName,
                      image.imageUrl,
                      false,
                      image.id,
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
                      {image.imageFolderName}
                    </span>
                    <span className="dashboardSectionImagesFolderCountList">
                      {JSON.parse(image.imageUrl).length}
                    </span>
                  </div>
                </div>
                <img
                  src="images/popup/dashboardEllipses.svg"
                  alt="icon"
                  className="dashboardSectionCollectionFolderOptionImgList"
                  onMouseEnter={() =>
                    handleShowActionOverlayList(image.imageFolderName, image.id)
                  }
                  onMouseLeave={handleHideActionOverlayList}
                />
                {modalList === `${image.imageFolderName}-${image.id}` && (
                  <div
                    className="dashboardDeleteModal"
                    onMouseEnter={() =>
                      handleShowActionOverlayList(
                        image.imageFolderName,
                        image.id,
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
          className="dashboardSectionImageDetailContainerList"
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
                    className="dashboardSectionImageDetailContentList"
                  >
                    <ImageWithFallback
                      src={data.url}
                      alt={data.name}
                      styleString="dashboardSectionImageDetailContentListImg"
                      fallbackSrc="icons/icon48.png"
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
                                existingDashboardImageDetail.id,
                                false,
                                false,
                                true,
                                false,
                                false,
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
              console.error('Invalid JSON in imageUrl:', error)
            }
            return null
          })()}
        </div>
      )}
    </>
  )
}
