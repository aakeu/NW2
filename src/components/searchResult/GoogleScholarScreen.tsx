import React, { useEffect, useState } from 'react'
import '../searchResult/SearchResult.css'
import {
  GoogleScholarSearchResult,
  GoogleSearchResult,
} from '../../state/types/search'
import {
  getFavicon,
  ImageWithFallback,
  openLink,
  useWebSummary,
} from '../reusables/Reusables'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../state'
import WebSummary from '../webSummary/WebSummary'
import { useNotification } from '../notification/NotificationContext'
import { setActiveLoginType } from '../../state/slice/loginModalSlice'
import { fetchTracking } from '../../state/slice/trackingSlice'
import { setActivationNeeded, setPaymentModalInfo } from '../../state/slice/reusableStatesSlice'
import { createBookmark, fetchAllBookmarks } from '../../state/slice/bookmarkSlice'
import { fetchAllImages } from '../../state/slice/imageSlice'
import { fetchAllVideos } from '../../state/slice/videoSlice'
import { fetchAllArticles } from '../../state/slice/articleSlice'
import { Spinner } from '../spinner/Spinner'

interface GoogleScholarScreenProps {
  searchResult: GoogleSearchResult | GoogleScholarSearchResult
}

const GoogleScholarScreen: React.FC<GoogleScholarScreenProps> = ({
  searchResult,
}) => {
  const openInNewTab = useSelector(
    (state: RootState) => state.openInNewTab.openInNewTab,
  )
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode)
  const { token, user } = useSelector((state: RootState) => state.auth)
  const [isCreatingBookmark, setIsCreatingBookmark] = useState(false); 
  const [notification, setNotification] = useState({ message: '', type: '' });
  const { selectedFolder } = useSelector((state: RootState) => state.reusable);
  const dispatch = useDispatch<AppDispatch>();
  const { createNotification } = useNotification();

  const {
    showWebSummary,
    handleLinkMouseEnter,
    handleLinkMouseLeave,
    handleSummaryMouseEnter,
    handleSummaryMouseLeave,
    webSummaryResult,
    webSummaryLoading,
    webSummaryError,
  } = useWebSummary(searchResult.link);

   useEffect(() => {
      const showNotification = (message: string, type: string) => {
        createNotification({
          message,
          duration: 5000,
          background:
            type === 'success' ? 'green' : type === 'warning' ? '#17a2b8' : 'red',
          color: '#fff',
        });
      };
      if (notification.message) {
        showNotification(notification.message, notification.type);
      }
    }, [notification]);
  
    const handleBookmarkCreate = async () => {
      if (!token) {
        setNotification({
          message: 'You must login to bookmark',
          type: 'warning',
        });
        dispatch(setActiveLoginType('signInModal'));
        return;
      }
  
      const tracking = await dispatch(fetchTracking()).unwrap();
      if (tracking.numberOfBookmarks > 30 && !user?.isSubscribed) {
        dispatch(setActivationNeeded(true));
        dispatch(
          setPaymentModalInfo(
            'You have exceeded the number of bookmarks for a free plan, upgrade your plan to continue using this service!',
          ),
        );
        return;
      }
  
      setIsCreatingBookmark(true);
      try {
        const bookmarksData = await dispatch(fetchAllBookmarks()).unwrap();
        const imgUrl = getFavicon(searchResult.link)
  
        const data = {
          imgUrl,
          snippet: searchResult.snippet,
          title: searchResult.title,
          url: searchResult.link,
          source: 'B',
          folderName: selectedFolder || '',
          description: '',
        };
  
        const bookmarkExists = bookmarksData.some(
          (bookmark) => bookmark.title === data.title,
        );
        if (bookmarkExists) {
          setNotification({
            message: `Bookmark with name "${data.title}" already exists`,
            type: 'error',
          });
          return;
        }
  
        await dispatch(createBookmark(data)).unwrap();
        setNotification({
          message: 'Bookmark created successfully',
          type: 'success',
        });
        await Promise.all([
          dispatch(fetchAllBookmarks()).unwrap(),
          dispatch(fetchAllImages()).unwrap(),
          dispatch(fetchAllVideos()).unwrap(),
          dispatch(fetchAllArticles()).unwrap(),
        ]);
      } catch (err) {
        console.error('Create bookmark error:', err);
        setNotification({
          message:
            err instanceof Error
              ? err.message
              : 'Failed to create bookmark. Please try again',
          type: 'error',
        });
      } finally {
        setIsCreatingBookmark(false);
      }
    };

  return (
    <div
      className={
        isDarkMode
          ? 'scholarSearchedResultContentsHolderDark'
          : 'scholarSearchedResultContentsHolder'
      }
    >
      <ImageWithFallback
        src={getFavicon(searchResult.link)}
        alt="favicon"
        styleString="scholarSearchResultPic"
        fallbackSrc="icons/icon48.png"
        handleClick={(e) => {
          e.preventDefault()
          openLink(searchResult.link, openInNewTab)
        }}
      />
      {/* <div className="scholarSearchResultsContent"> */}
      <div className="scholarSearchResultsContentContainer">
        <h3
          className={
            isDarkMode
              ? 'scholarSearchResultContentHeaderDark'
              : 'scholarSearchResultContentHeader'
          }
          onClick={(e) => {
            e.preventDefault()
            openLink(searchResult.link, openInNewTab)
          }}
        >
          {searchResult?.title?.length > 40
            ? searchResult.title.slice(0, 40) + '...'
            : searchResult?.title || 'No title available'}
        </h3>
        <p
          className={
            isDarkMode
              ? 'scholarSearchResultContentDescDark'
              : 'scholarSearchResultContentDesc'
          }
        >
          {searchResult?.snippet?.length > 100
            ? searchResult.snippet.slice(0, 100) + '...'
            : searchResult?.snippet || 'No description available'}
        </p>
        <span className="scholarSearchResultAuthors">
          <strong>Authors: </strong>
          {'publication_info' in searchResult &&
          searchResult?.publication_info?.authors ? (
            searchResult.publication_info.authors.map(
              (a: any, index: number) => (
                <span key={a.link}>
                  <a href={a.link} target="_blank" rel="noopener noreferrer">
                    {a.name}
                  </a>
                  {index < searchResult.publication_info.authors.length - 1 &&
                    ', '}
                </span>
              ),
            )
          ) : (
            <span>Not Available</span>
          )}
        </span>
        <div className="pdfCitationsRelatedPages">
          <span>
            <strong className="scholarSearchResultPdfsHeading">PDFs:</strong>{' '}
            {'resources' in searchResult &&
            searchResult?.resources &&
            Array.isArray(searchResult.resources) ? (
              searchResult.resources
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
              href={
                'inline_links' in searchResult &&
                searchResult?.inline_links?.cited_by?.link
              }
              className="visit__link"
              target="_blank"
              rel="noopener noreferrer"
            >
              {'inline_links' in searchResult &&
                searchResult?.inline_links?.cited_by?.total}{' '}
              Citations
            </a>
          </span>
          <span>
            <a
              href={
                'inline_links' in searchResult &&
                searchResult?.inline_links?.related_pages_link
              }
              className="visit__link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Related Pages
            </a>
          </span>
        </div>
        {token && (
          <div className="scholarSearchResultsContentDetail">
            <span
              onClick={(e) => {
                e.preventDefault()
                openLink(searchResult.link, openInNewTab)
              }}
              onMouseEnter={handleLinkMouseEnter}
              onMouseLeave={handleLinkMouseLeave}
            >
              See details {'>'}
            </span>
            {showWebSummary && (
              <div className="webSummaryContainer">
                <WebSummary
                 result={webSummaryResult}
                 isLoading={webSummaryLoading}
                 onMouseEnter={handleSummaryMouseEnter}
                 onMouseLeave={handleSummaryMouseLeave}
                 webSummaryError={webSummaryError}
                />
              </div>
            )}
          </div>
        )}
      </div>
      {/* </div> */}
      {isCreatingBookmark ? (
        <div
          style={{
            display: 'flex',
            marginLeft: "30px"
          }}
        >
          <Spinner />
        </div>
      ) : (
      <div className="scholarBookmarkIconHolder" onClick={handleBookmarkCreate}>
        <img
          src="images/bookmarkIcon.svg"
          alt="bookmarkIcon"
          className="scholarBookmarkIcon"
        />
      </div>
      )}

    </div>
  )
}

export default GoogleScholarScreen
