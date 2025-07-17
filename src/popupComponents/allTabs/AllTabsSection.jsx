import React, { useCallback, useEffect, useState, useMemo } from 'react'
import '../allTabs/AllTabsSection.css'
import ReusableFolderContents from '../reusableFolder/ReusableFolderContents'
import {
  backToAllTabsSection,
  backToCurrentTabSection,
} from '../../utils/sectionManagement'
import {
  getChromeStorage,
  ImageWithFallback,
  setChromeStorage,
  Spinner,
} from '../../utils/utility'
import { create_bookmark } from '../../api/bookmark'
import { useAuth } from '../../utils/AuthContext'
import { useNotification } from '../notification/NotificationContext'
import { filteredBookmarksData } from '../../utils/filteredData'
import Backdrop from '../backdrop/Backdrop'
import PaymentModal from '../paymentModal/PaymentModal'

export default function AllTabsSection({
  allFolders,
  setShowFolderModal,
  allBookmarks,
  setAllBookmarks,
  trackingRecord,
  userDetail,
}) {
  const [folderOpen, setFolderOpen] = useState(false)
  const [selectedFolder, setSelectedFolder] = useState(null)
  const [noOfTabsSelected, setNoOfTabsSelected] = useState(null)
  const [allTabsSelectedText, setAllTabsSelectedText] = useState(null)
  const [dataFoundInStorage, setDataFoundInStorage] = useState([])
  const [dataNotFoundInStorage, setDataNotFoundInStorage] = useState([])
  const [isChecked, setIsChecked] = useState(false)
  const [hideAllTabsCheck, setHideAllTabsCheck] = useState(false)
  const [creatingAllTabs, setCreatingAllTabs] = useState(false)
  const [notification, setNotification] = useState({ message: '', type: '' })
  const { fetchDetailsAssociatedWithBookmarks } = useAuth()
  const { createNotification } = useNotification()

  const [activationNeeded, setActivationNeeded] = useState(false)
  const [paymentModalInfo, setPaymentModalInfo] = useState(null)

  const handleShowFolderModal = async () => {
    if (
      trackingRecord &&
      trackingRecord.numberOfFolders > 4 &&
      !userDetail?.user?.isSubscribed
    ) {
      setActivationNeeded(true)
      setActivationNeeded(true)
      setPaymentModalInfo(
        'You have exceeded the number of folders for a free plan, upgrade your plan to continue using this service!',
      )
    } else {
      setShowFolderModal(true)
    }
  }

  const handleSelectFolder = (folder) => {
    setSelectedFolder(folder)
    setFolderOpen(false)
  }

  const handleFolderOpen = (event) => {
    event.stopPropagation()
    setFolderOpen((prev) => !prev)
  }

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
    if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ type: 'GET_STORED_DATA' })
    }
  }, [])

  const fetchTabsToAdd = useCallback(async () => {
    const tabsToAdd = (await getChromeStorage('tabsToAdd')) || []
    return tabsToAdd.filter((tab) => tab.toAdd === true)
  }, [])

  const getAllTabsSelectedText = useCallback(async () => {
    const text = await getChromeStorage('allTabsSelectedText')
    const tabs = await new Promise((resolve) => {
      chrome.tabs.query({}, resolve)
    })

    let uniqueUrls = {}
    let allTabs = []

    for (const tab of tabs) {
      const url = tab.url || ''
      if (
        !uniqueUrls[url] &&
        url !== '' &&
        (url.startsWith('http://') || url.startsWith('https://')) &&
        !url.startsWith('chrome://extensions/')
      ) {
        uniqueUrls[url] = true

        const tabData = {
          title: tab.title,
          url: tab.url,
          source: 'T',
          image: tab.favIconUrl,
          from: 'tabs',
        }

        allTabs.push(tabData)
      }
    }
    if (allTabs.length < 1) {
      setHideAllTabsCheck(true)
      setAllTabsSelectedText('No tabs selected')
    } else if (text === 'All Tabs Selected' && allTabs.length > 0) {
      setIsChecked(true)
      setAllTabsSelectedText(text)
      setHideAllTabsCheck(false)
    } else {
      setIsChecked(false)
      setAllTabsSelectedText(null)
      setHideAllTabsCheck(false)
    }
  })

  const updateTabSelectionText = useCallback(
    async (allTabsToAdd, uniqueUrlCount) => {
      const count = allTabsToAdd.length
      setNoOfTabsSelected(
        count > 0
          ? `${count} Tab${count > 1 ? 's' : ''} Selected`
          : 'No Tabs Selected',
      )
      // setAllTabsSelectedText(
      //   allTabsToAdd.length  === uniqueUrlCount ? 'All Tabs Selected' : null,
      // )
    },
    [],
  )

  const tabsExecution = async () => {
    let tabsResult = []
    const allTabsToAdd = await fetchTabsToAdd()
    await getAllTabsSelectedText()

    chrome.tabs.query({}, async (tabs) => {
      const uniqueUrls = {}
      const foundInStorage = []
      const notFoundInStorage = []

      const openedTabs = tabs.filter(
        (tab) =>
          tab.url &&
          (tab.url.startsWith('http://') || tab.url.startsWith('https://')) &&
          !tab.url.startsWith('chrome://extensions/'),
      )

      openedTabs.forEach((tab) => {
        const { url, title, favIconUrl: tabFavicon } = tab
        if (!uniqueUrls[url]) {
          uniqueUrls[url] = true
          const isInBookmarks =
            Array.isArray(allBookmarks) &&
            allBookmarks.some(
              (entry) => entry.url === url && entry.title === title,
            )
          const shortenedTitle =
            title.length > 20 ? `${title.slice(0, 20)}...` : title

          if (isInBookmarks) {
            foundInStorage.push({
              title,
              url,
              image: tabFavicon,
              source: 'T',
              from: 'tabs',
            })
          } else {
            notFoundInStorage.push({
              title,
              url,
              image: tabFavicon,
              source: 'T',
              from: 'tabs',
              toAdd: false,
            })
          }
        }
      })

      setDataFoundInStorage(foundInStorage)
      setDataNotFoundInStorage(notFoundInStorage)

      if (notFoundInStorage.length < 1) {
        setHideAllTabsCheck(true)
      } else {
        setHideAllTabsCheck(false)
      }

      const uniqueUrlCount = Object.keys(uniqueUrls).length
      await updateTabSelectionText(allTabsToAdd, uniqueUrlCount)

      for (const item of allTabsToAdd) {
        const matchingTab = tabs.find(
          (tab) => tab.title === item.title && tab.url === item.url,
        )
        if (matchingTab) {
          tabsResult.push(item)
        }
      }

      setDataNotFoundInStorage((prevState) =>
        prevState.map((item) => {
          const filteredTabsResult = tabsResult.filter((data) => {
            return !(dataFoundInStorage || []).some(
              (result) => result.url === data.url,
            )
          })

          const matchingTabResult = filteredTabsResult.find(
            (tab) => tab.url === item.url && tab.toAdd,
          )
          if (matchingTabResult) {
            return { ...item, toAdd: true }
          }
          return item
        }),
      )

      // setTabToAddResults(tabsResult)
      await setChromeStorage({ tabsToAdd: tabsResult })
    })
  }
  useEffect(() => {
    tabsExecution()
  }, [fetchTabsToAdd, updateTabSelectionText])

  const handleTabToAdd = async (url) => {
    if (!url) {
      return
    }

    chrome.tabs.query({}, async (tabs) => {
      for (const tab of tabs) {
        if (tab.url === url) {
          const tabData = {
            title: tab.title,
            url: tab.url,
            source: 'T',
            image: tab.favIconUrl,
            from: 'tabs',
            toAdd: true,
          }

          let allTabsToAdd = await fetchTabsToAdd()
          const existingTab = allTabsToAdd.find(
            (dt) => dt.title === tabData.title && dt.url === tabData.url,
          )

          if (allTabsSelectedText === 'All Tabs Selected') {
            await setChromeStorage({ allTabsSelectedText: null })
          }

          if (existingTab) {
            allTabsToAdd = allTabsToAdd.filter(
              (dt) =>
                dt.title !== existingTab.title || dt.url !== existingTab.url,
            )
            await setChromeStorage({ tabsToAdd: allTabsToAdd })
          } else {
            allTabsToAdd.push(tabData)
            await setChromeStorage({ tabsToAdd: allTabsToAdd })
          }
          tabsExecution()
          return
        }
      }
    })
  }

  const handleChecked = async (isAddAll) => {
    const tabs = await new Promise((resolve) => {
      chrome.tabs.query({}, resolve)
    })

    let uniqueUrls = {}
    let allTabs = []

    for (const tab of tabs) {
      const url = tab.url || ''
      if (
        !uniqueUrls[url] &&
        url !== '' &&
        (url.startsWith('http://') || url.startsWith('https://')) &&
        !url.startsWith('chrome://extensions/')
      ) {
        uniqueUrls[url] = true

        const tabData = {
          title: tab.title,
          url: tab.url,
          source: 'T',
          image: tab.favIconUrl,
          from: 'tabs',
          toAdd: isAddAll ? true : false,
        }

        allTabs.push(tabData)
      }
    }

    let allTabsToAdd = await fetchTabsToAdd()

    const tabsInAllTabsNotInBookmarkStorage = allTabs.filter((tab) => {
      return !(allBookmarks || []).some((bookmark) => {
        return bookmark.title === tab.title && bookmark.url === tab.url
      })
    })

    allTabsToAdd = tabsInAllTabsNotInBookmarkStorage
    await setChromeStorage({ tabsToAdd: allTabsToAdd })

    tabsExecution()
  }

  const handleSelectAllTabsToggle = async () => {
    setIsChecked((prevChecked) => {
      const newCheckedState = !prevChecked
      ;(async () => {
        if (newCheckedState) {
          await handleChecked(true)
          setAllTabsSelectedText('All Tabs Selected')
          await setChromeStorage({ allTabsSelectedText: 'All Tabs Selected' })
        } else {
          await handleChecked(false)
          setAllTabsSelectedText(null)
          await setChromeStorage({ allTabsSelectedText: null })
        }
      })()

      return newCheckedState
    })
  }

  const handleSaveAllTabs = async (event) => {
    event.preventDefault()
    setTimeout(async () => {
      setCreatingAllTabs(true)

      const successTabs = []
      const errorTabs = []

      for (const data of dataNotFoundInStorage) {
        if (data.toAdd) {
          try {
            const response = await create_bookmark(
              data.image,
              null,
              data.title,
              data.url,
              data.source,
              selectedFolder,
              null,
            )

            if (response.success) {
              successTabs.push(data.title)
            } else {
              errorTabs.push({ title: data.title, message: response.message })
            }
          } catch (error) {
            errorTabs.push({
              title: data.title,
              message: `Unexpected error: Please try again!`,
            })
          }
        }
      }

      setCreatingAllTabs(false)

      if (successTabs.length > 0) {
        setNotification({
          message: `Successfully saved ${successTabs.length} tab(s).`,
          type: 'success',
        })
        await fetchDetailsAssociatedWithBookmarks()
      }

      if (errorTabs.length > 0) {
        const errorMessages = errorTabs
          .map((error) => `Failed to save "${error.title}": ${error.message}`)
          .join('\n')
        console.error(errorMessages)
        setNotification({
          message: `Some tabs could not be saved:\n${errorMessages}`,
          type: 'error',
        })
      }
    }, 100)
  }

  return (
    <>
      <div className="allTabsContainer">
        <h2 className="allTabsContainerHeader">
          Save All <span className="allTabsContainerHeaderSub">Tabs</span>
        </h2>
        <h3 className="allTabsTotalCount">{`Found ${
          dataFoundInStorage &&
          dataNotFoundInStorage &&
          dataFoundInStorage.length + dataNotFoundInStorage.length
        } Tabs`}</h3>
        <div className="allTabsContentsContainer">
          <div className="allTabsContentHeader">Tabs</div>
          <div className="allTabsContentsHolder">
            {dataFoundInStorage.length > 0 &&
              dataFoundInStorage.map((dt, index) => (
                <div
                  key={`${dt.url}-${index}`}
                  className="allTabsContentsDetailFoundInStorage"
                >
                  <ImageWithFallback
                    src={dt.image}
                    alt="link favicon"
                    styleString="allTabsContentDetailImg"
                    fallbackSrc="icons/icon48.png"
                  />
                  {dt.title.length > 20
                    ? `${dt.title.slice(0, 20)}...`
                    : dt.title}
                </div>
              ))}

            {dataNotFoundInStorage.length > 0 &&
              dataNotFoundInStorage.map((dt, index) => (
                <div
                  key={`${dt.url}-${index}`}
                  className={
                    dt.toAdd
                      ? 'allTabsContentsDetailToAdd'
                      : 'allTabsContentsDetail'
                  }
                  onClick={() => handleTabToAdd(dt.url)}
                >
                  <ImageWithFallback
                    src={dt.image}
                    alt="link favicon"
                    styleString="allTabsContentDetailImg"
                    fallbackSrc="icons/icon48.png"
                  />
                  {dt.title.length > 20
                    ? `${dt.title.slice(0, 20)}...`
                    : dt.title}
                </div>
              ))}
            {dataFoundInStorage.length < 1 &&
              dataNotFoundInStorage.length < 1 && (
                <div className="allTabsNoContents">
                  No tabs available. <br />
                  Please open some tabs to see them here..
                </div>
              )}
          </div>
        </div>
        <div className="allTabsSelectAllTabs">
          {!hideAllTabsCheck && (
            <input
              type="checkbox"
              className="allTabsSelectAllCheckbox"
              checked={isChecked}
              onChange={handleSelectAllTabsToggle}
            />
          )}
          {allTabsSelectedText ? (
            <span className="allTabsSelectAllText">{allTabsSelectedText}</span>
          ) : (
            <span className="allTabsSelectAllText">{noOfTabsSelected}</span>
          )}
        </div>
        <div className="allTabsCollectionHolder">
          <h3 className="allTabsCollectionHeader">Collection</h3>
          <div className="allTabsFolderContentsHolder">
            <ReusableFolderContents
              handleFolderOpen={handleFolderOpen}
              selectedFolder={selectedFolder}
              folderOpen={folderOpen}
              setFolderOpen={setFolderOpen}
              allFolders={allFolders}
              handleSelectFolder={handleSelectFolder}
              isMarginLeft={false}
              placedOnTop={true}
            />
            <img
              src="images/popup/folderIcon.svg"
              alt="folder"
              className="allTabsFolderImg"
              onClick={handleShowFolderModal}
            />
          </div>
        </div>
        <div className="allTabsTabsBtnHolder">
          <div></div>
          <div className="allTabsBtnHolder">
            <button
              className="allTabsCurrentTabBtn"
              onClick={backToCurrentTabSection}
            >
              Save Current Tab
            </button>
            {creatingAllTabs ? (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '19px',
                  height: '19px',
                }}
              >
                <Spinner />
              </div>
            ) : (
              <button
                disabled={
                  noOfTabsSelected === 'No Tabs Selected' &&
                  !allTabsSelectedText
                }
                className={
                  noOfTabsSelected === 'No Tabs Selected' &&
                  !allTabsSelectedText
                    ? 'allTabsSubmitBtnExtra'
                    : 'allTabsSubmitBtn'
                }
                onClick={handleSaveAllTabs}
              >
                Save Tabs
              </button>
            )}
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
