import React, { useEffect, useState } from 'react'
import '../currentTab/CurrentTabSection.css'
import ReusableFolderContents from '../reusableFolder/ReusableFolderContents'
import { isValidUrl, Spinner } from '../../utils/utility'
import { useNotification } from '../notification/NotificationContext'
import { tabScreenshotCapture } from '../../utils/tabScreenshotCapture'
import { create_bookmark } from '../../api/bookmark'
import { useAuth } from '../../utils/AuthContext'
import { backToAllTabsSection } from '../../utils/sectionManagement'
import Backdrop from '../backdrop/Backdrop'
import PaymentModal from '../paymentModal/PaymentModal'

export default function CurrentTabSection({
  allFolders,
  setShowFolderModal,
  trackingRecord,
  userDetail,
}) {
  const [folderOpen, setFolderOpen] = useState(false)
  const [selectedFolder, setSelectedFolder] = useState(null)
  const [tabScreenshot, setTabScreenshot] = useState(null)
  const [tabFaviconUrl, setTabFaviconUrl] = useState(null)
  const [url, setUrl] = useState(null)
  const [title, setTitle] = useState(null)
  const [creatingCurrentTab, setCreatingCurrentTab] = useState(false)
  const [description, setDescription] = useState('')
  const [notification, setNotification] = useState({ message: '', type: '' })
  const { createNotification } = useNotification()
  const { fetchDetailsAssociatedWithBookmarks } = useAuth()
  const [activationNeeded, setActivationNeeded] = useState(false)
  const [paymentModalInfo, setPaymentModalInfo] = useState(null)

  const handleShowFolderModal = async () => {
    if (
      trackingRecord &&
      trackingRecord.numberOfFolders > 4 &&
      !userDetail?.user?.isSubscribed
    ) {
      setActivationNeeded(true)
      setPaymentModalInfo(
        'You have exceeded the number of folders for a free plan, upgrade your plan to continue using this service!',
      )
    } else {
      setShowFolderModal(true)
    }
  }

  const handleDescription = (event) => {
    setDescription(event.target.value)
  }

  const handleSelectFolder = (folder) => {
    setSelectedFolder(folder)
    setFolderOpen(false)
  }

  const handleFolderOpen = (event) => {
    event.stopPropagation()
    setFolderOpen((prev) => !prev)
  }

  const handleUrlChange = () => {}

  useEffect(() => {
    const showNotification = (message, type) => {
      createNotification({
        message: message,
        duration: 5000,
        background:
          type === 'success' ? 'green' : type === 'warning' ? '#17a2b8' : 'red',
        color: '#fff',
      })
    }
    if (notification.message) {
      showNotification(notification.message, notification.type)
    }
  }, [notification])

  useEffect(() => {
    async function captureScreenshot() {
      try {
        const screenshotUrl = await tabScreenshotCapture()
        if (screenshotUrl) {
          setTabScreenshot(screenshotUrl)
        }
      } catch (error) {
        console.error('Error capturing screenshot:', error)
      }
    }
    captureScreenshot()
  }, [])

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const currentTab = tabs[0]
      setUrl(currentTab.url)
      setTitle(currentTab.title)
      setTabFaviconUrl(currentTab.favIconUrl)

      if (!isValidUrl(currentTab.url)) {
        setTitle(null)
        setUrl(null)
        setNotification({
          message: `You cannot save an empty or invalid tab`,
          type: 'error',
        })
        return
      }
    })
  }, [])

  const handleSaveCurrentTab = async (event) => {
    event.preventDefault()
    setTimeout(async () => {
      if (!isValidUrl(url)) {
        setTitle(null)
        setUrl(null)
        setNotification({
          message: `You cannot save an empty or invalid tab`,
          type: 'error',
        })
        return
      }
      setCreatingCurrentTab(true)
      const response = await create_bookmark(
        tabFaviconUrl,
        null,
        title,
        url,
        'T',
        selectedFolder,
        description,
      )
      setCreatingCurrentTab(false)
      if (response.success) {
        await fetchDetailsAssociatedWithBookmarks()
        setNotification({ message: response.message, type: 'success' })
      } else {
        console.error(response.message)
        setNotification({ message: response.message, type: 'error' })
      }
    }, 100)
  }
  return (
    <>
      <div className="currentTabContainer">
        <h2 className="currentTabHeader">
          Save <span className="currentTabHeaderSub">Tab</span>
        </h2>
        <div className="currentTabContentHolder">
          <div className="currentTabImgHolder">
            <img
              src={tabScreenshot ? tabScreenshot : `images/popup/currentTabImg.svg`}
              alt="currentTabImg"
              className="currentTabImg"
            />
          </div>
          <div className="currentTabContents">
            <h3 className="currentTabContentsHeader">
              {title ? title : 'Tab Name'}
            </h3>
            {!title && (
              <span className="currentTabInfo">
                There are no carriers or apps available...
              </span>
            )}
            <h3 className="currentTabContentsDescHeader">Description</h3>
            <textarea
              rows={3}
              className="currentTabContentsDesc"
              onChange={handleDescription}
              value={description}
            ></textarea>
            <div className="currentTabCollectionHolder">
              <h3 className="currentTabCollectionHeader">Collection</h3>
              <img
                src="images/popup/folderIcon.svg"
                alt="folder"
                className="collectionFolderIcon"
                onClick={handleShowFolderModal}
              />
            </div>
            <ReusableFolderContents
              handleFolderOpen={handleFolderOpen}
              selectedFolder={selectedFolder}
              folderOpen={folderOpen}
              setFolderOpen={setFolderOpen}
              allFolders={allFolders}
              handleSelectFolder={handleSelectFolder}
              isMarginLeft={false}
              placedOnTop={false}
            />
            <h3 className="currentTabCollectionTag">Tags</h3>
            <input
              type="text"
              className="currentTabCollectionTagInput"
              placeholder="Add tags..."
            />
            <h3 className="currentTabCollectionUrl">URL</h3>
            <input
              type="text"
              className="currentTabCollectionUrlInput"
              placeholder="https://community.shopify.com/c/payments-shipping-and/quot-there-are-no-..."
              value={url === null ? '' : url}
              onChange={handleUrlChange}
            />
            <div className="currentTabsBtnHolder">
              <button className="allTabsBtn" onClick={backToAllTabsSection}>
                <img
                  src="images/popup/allTabsIcon.svg"
                  alt="allTabsImg"
                  className="allTabsImg"
                />{' '}
                Save All Tabs
              </button>
              {creatingCurrentTab ? (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Spinner />
                </div>
              ) : (
                <button
                  disabled={!url || !title}
                  className={`${
                    !url || !title ? 'currentTabBtnExtra' : 'currentTabBtn'
                  }`}
                  onClick={handleSaveCurrentTab}
                >
                  Save Tab
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {activationNeeded && (
        <>
          <Backdrop />
          <PaymentModal
            setActivationNeeded={setActivationNeeded}
            info={paymentModalInfo}
          />
        </>
      )}
    </>
  )
}
