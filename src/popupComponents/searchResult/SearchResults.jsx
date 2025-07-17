import React, { useState, useRef, useEffect } from 'react'
import '../searchResult/SearchResults.css'
import { openLink, Spinner, useWebSummary } from '../../utils/utility'
import WebSummary from '../webSummary/WebSummary'
import Backdrop from '../backdrop/Backdrop'
import { create_bookmark } from '../../api/bookmark'
import { getSecureToken } from '../../api/auth'
import LoginModal from '../loginModal/LoginModal'
import VerifyAccount from '../loginModal/VerifyAccount'
import { useNotification } from '../notification/NotificationContext'
import { useAuth } from '../../utils/AuthContext'
import PaymentModal from '../paymentModal/PaymentModal'

export default function SearchResults({
  result,
  selectedFolder,
  userDetail,
  trackingRecord,
  isChecked,
}) {
  const [creatingBookmark, setCreatingBookmark] = useState(false)
  const [notification, setNotification] = useState({ message: '', type: '' })
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [verifyAccount, setVerifyAccount] = useState(false)
  const [activationNeeded, setActivationNeeded] = useState(false)
  const [paymentModalInfo, setPaymentModalInfo] = useState(null)
  const { createNotification } = useNotification()
  const { fetchDetailsAssociatedWithBookmarks } = useAuth()

  const {
    showWebSummary,
    handleShowWebSummary,
    handleHideWebSummary,
    webSummaryResult,
    webSummaryLoading,
  } = useWebSummary(result.link)

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

  const openVerifyAccount = () => {
    setVerifyAccount(true)
    setShowLoginModal(false)
  }
  const closeVerifyAccount = () => {
    setVerifyAccount(false)
  }

  const handleBookmarkCreate = async () => {
    if (
      trackingRecord &&
      trackingRecord.numberOfBookmarks > 28 &&
      !userDetail?.user?.isSubscribed
    ) {
      setActivationNeeded(true)
      setPaymentModalInfo(
        'You have exceeded the number of bookmarks for a free plan, upgrade your plan to continue using this service!',
      )
    } else {
      const token = await getSecureToken('token')
      setTimeout(async () => {
        if (!token) {
          setNotification({
            message: `You must login to bookmark`,
            type: 'warning',
          })
          setShowLoginModal(true)
          return
        }

        setCreatingBookmark(true)
        const imgUrl =
          result.pagemap && result.pagemap.cse_thumbnail
            ? result.pagemap.cse_thumbnail[0].src
            : 'icons/icon48.png'

        const response = await create_bookmark(
          imgUrl,
          result.snippet,
          result.title,
          result.link,
          'B',
          selectedFolder,
          null,
        )
        setCreatingBookmark(false)
        if (response.success) {
          await fetchDetailsAssociatedWithBookmarks()
          setNotification({ message: response.message, type: 'success' })
        } else {
          console.error(response.message)
          setNotification({ message: response.message, type: 'error' })
        }
      }, 100)
    }
  }

  return (
    <>
      <div className="searchResultsContainer">
        <div className="searchResultsContentsHolder">
          <div className="searchResultsContent">
            <img
              src={
                result.pagemap && result.pagemap.cse_thumbnail
                  ? result.pagemap.cse_thumbnail[0].src
                  : 'icons/icon48.png'
              }
              alt="pic"
              className="searchResultPic"
              onClick={(e) => {
                e.preventDefault()
                openLink(result.link, isChecked)
              }}
            />
            <div className="searchResultsContentContainer">
              <h3
                onClick={(e) => {
                  e.preventDefault()
                  openLink(result.link, isChecked)
                }}
                className="searchResultContentHeader"
              >
                {result.title}
              </h3>
              <p className="searchResultContentDesc">{result.snippet}</p>
              <div className="searchResultsContentDetail">
                {userDetail && userDetail.token && (
                  <span
                    onMouseEnter={handleShowWebSummary}
                    onMouseLeave={handleHideWebSummary}
                    onClick={(e) => {
                      e.preventDefault()
                      openLink(result.link, isChecked)
                    }}
                  >
                    See details {'>'}
                  </span>
                )}
                {showWebSummary && (
                  <div className="webSummaryContainer">
                    <WebSummary
                      result={webSummaryResult}
                      isLoading={webSummaryLoading}
                      onMouseEnter={handleShowWebSummary}
                      onMouseLeave={handleHideWebSummary}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          {creatingBookmark ? (
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
            <div className="bookmarkIconHolder" onClick={handleBookmarkCreate}>
              <img
                src="images/popup/bookmarkIcon.svg"
                alt="bookmarkIcon"
                className="bookmarkIcon"
              />
            </div>
          )}
        </div>
      </div>
      {showLoginModal && (
        <>
          <Backdrop />
          <LoginModal
            setShowLoginModal={setShowLoginModal}
            openVerifyAccount={openVerifyAccount}
          />
        </>
      )}
      {verifyAccount && (
        <>
          <Backdrop />
          <VerifyAccount closeVerifyAccount={closeVerifyAccount} />
        </>
      )}
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
