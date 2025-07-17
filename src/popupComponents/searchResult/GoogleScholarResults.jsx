import React, { useEffect, useState } from 'react'
import {
  ImageWithFallback,
  openLink,
  Spinner,
  useWebSummary,
} from '../../utils/utility'
import { getFavicon } from '../../api/google_api'
import WebSummary from '../webSummary/WebSummary'
import Backdrop from '../backdrop/Backdrop'
import { useNotification } from '../notification/NotificationContext'
import { useAuth } from '../../utils/AuthContext'
import LoginModal from '../loginModal/LoginModal'
import VerifyAccount from '../loginModal/VerifyAccount'
import { getSecureToken } from '../../api/auth'
import { create_bookmark } from '../../api/bookmark'

export default function GoogleScholarResults({
  result,
  selectedFolder,
  isChecked,
}) {
  const [creatingBookmark, setCreatingBookmark] = useState(false)
  const [notification, setNotification] = useState({ message: '', type: '' })
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [verifyAccount, setVerifyAccount] = useState(false)
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
      const imgUrl = getFavicon(result.link)

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
  return (
    <>
      <div className="googleScholarResultContainer">
        <div className="scholarSearchedResultContentsHolder">
          <div className="scholarSearchResultsContent">
            <ImageWithFallback
              src={getFavicon(result.link)}
              alt="favicon"
              styleString="scholarSearchResultPic"
              fallbackSrc="icons/icon48.png"
              handleClick={(e) => {
                e.preventDefault()
                openLink(result.link, isChecked)
              }}
            />
            <div className="scholarSearchResultsContentContainer">
              <h3
                className="scholarSearchResultContentHeader"
                onClick={(e) => {
                  e.preventDefault()
                  openLink(result.link, isChecked)
                }}
              >
                {result.title}
              </h3>
              <p className="scholarSearchResultContentDesc">{result.snippet}</p>
              <span className="scholarSearchResultAuthors">
                <strong>Authors: </strong>
                {result?.publication_info?.authors ? (
                  result.publication_info.authors.map((a, index) => (
                    <span key={a.link}>
                      <a
                        href={a.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {a.name}
                      </a>
                      {index < result.publication_info.authors.length - 1 &&
                        ', '}
                    </span>
                  ))
                ) : (
                  <span>Not Available</span>
                )}
              </span>
              <div className="pdfCitationsRelatedPages">
                <span>
                  <strong className="scholarSearchResultPdfsHeading">
                    PDFs:
                  </strong>{' '}
                  {result?.resources && Array.isArray(result.resources) ? (
                    result.resources
                      .filter((dt) => dt.file_format === 'PDF')
                      .map((dt, index, array) => (
                        <span key={dt.link}>
                          <a
                            href={dt.link}
                            className="visit__link"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {dt.title}
                          </a>
                          {index < array.length - 1 && ', '}
                        </span>
                      ))
                  ) : (
                    <span>No PDFs Available</span>
                  )}
                </span>
                <span>
                  <a
                    href={result?.inline_links?.cited_by?.link}
                    className="visit__link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {result?.inline_links?.cited_by?.total} Citations
                  </a>
                </span>
                <span>
                  <a
                    href={result?.inline_links?.related_pages_link}
                    className="visit__link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Related Pages
                  </a>
                </span>
              </div>
              <div className="scholarSearchResultsContentDetail">
                <span
                  onClick={(e) => {
                    e.preventDefault()
                    openLink(result.link, isChecked)
                  }}
                  onMouseEnter={handleShowWebSummary}
                  onMouseLeave={handleHideWebSummary}
                >
                  See details {'>'}
                </span>
                {showWebSummary && (
                  <div className="webSummaryContainer">
                    <WebSummary
                      result={webSummaryResult}
                      isLoading={webSummaryLoading}
                      onMouseEnter={handleShowWebSummary}
                      onMouseLeave={handleHideWebSummary}
                      tabIndex={0}
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
            <div
              className="scholarBookmarkIconHolder"
              onClick={handleBookmarkCreate}
            >
              <img
                src="images/popup/bookmarkIcon.svg"
                alt="bookmarkIcon"
                className="scholarBookmarkIcon"
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
    </>
  )
}
