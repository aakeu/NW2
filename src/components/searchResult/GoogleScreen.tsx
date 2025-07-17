import React, { useEffect, useState } from 'react';
import '../searchResult/SearchResult.css';
import {
  GoogleScholarSearchResult,
  GoogleSearchResult,
} from '../../state/types/search';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../state';
import { openLink, useWebSummary } from '../reusables/Reusables';
import WebSummary from '../webSummary/WebSummary';
import { fetchTracking } from '../../state/slice/trackingSlice';
import {
  setActivationNeeded,
  setPaymentModalInfo,
} from '../../state/slice/reusableStatesSlice';
import { setActiveLoginType } from '../../state/slice/loginModalSlice';
import {
  createBookmark,
  fetchAllBookmarks,
} from '../../state/slice/bookmarkSlice';
import { fetchAllImages } from '../../state/slice/imageSlice';
import { fetchAllVideos } from '../../state/slice/videoSlice';
import { fetchAllArticles } from '../../state/slice/articleSlice';
import { Spinner } from '../spinner/Spinner';
import { useNotification } from '../notification/NotificationContext';
import OnboardingModal from '../onboarding/Onboarding';

interface GoogleScreenProps {
  searchResult: GoogleSearchResult | GoogleScholarSearchResult;
  index: number
}

const GoogleScreen: React.FC<GoogleScreenProps> = ({ searchResult, index }) => {
  const [isCreatingBookmark, setIsCreatingBookmark] = useState(false); 
  const [notification, setNotification] = useState({ message: '', type: '' });
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const openInNewTab = useSelector(
    (state: RootState) => state.openInNewTab.openInNewTab,
  );
  const { token, user } = useSelector((state: RootState) => state.auth);
  const { selectedFolder, isOnboardingVisitSite, isOnboardingBookmark } = useSelector((state: RootState) => state.reusable);
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
    if (tracking.numberOfBookmarks >= 30 && !user?.isSubscribed) {
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
      const imgUrl =
        'pagemap' in searchResult && searchResult.pagemap.cse_thumbnail
          ? searchResult.pagemap.cse_thumbnail[0].src
          : 'icons/icon48.png';

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
        isDarkMode ? 'searchResultInfoHolderDark' : 'searchResultInfoHolder'
      }
    >
      <img
        src={
          'pagemap' in searchResult && searchResult.pagemap.cse_thumbnail
            ? searchResult.pagemap.cse_thumbnail[0].src
            : 'icons/icon48.png'
        }
        alt={searchResult.title}
        className="searchResultsImage"
        onClick={(e) => {
          e.preventDefault();
          openLink(searchResult.link, openInNewTab);
        }}
      />
      <div className="searchResultsInfoHolder">
        <h3
          className={
            isDarkMode ? 'searchResultsTitleDark' : 'searchResultsTitle'
          }
        >
          {searchResult?.title?.length > 40
            ? searchResult.title.slice(0, 40) + '...'
            : searchResult?.title || 'No title available'}
        </h3>
        <p
          className={
            isDarkMode
              ? 'searchResultsDescriptionDark'
              : 'searchResultsDescription'
          }
        >
          {searchResult?.snippet?.length > 100
            ? searchResult.snippet.slice(0, 100) + '...'
            : searchResult?.snippet || 'No description available'}
        </p>
        {token && (
          <div className="scholarSearchResultsContentDetail">
            <div className='searchResultsLinkContainer'>
              <span
                onClick={(e) => {
                  e.preventDefault();
                  openLink(searchResult.link, openInNewTab);
                }}
                className="searchResultsLink"
                onMouseEnter={handleLinkMouseEnter}
                onMouseLeave={handleLinkMouseLeave}
              >
                See Details {'>'}
              </span>
              {isOnboardingVisitSite && index === 0 && (
                <OnboardingModal 
                  style={{ 
                    display: "block", 
                    position: "absolute", 
                    top: "-98px", 
                    left: "40%" 
                  }}
                  tipPosition="bottomCenter"
                />
              )}
            </div>
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
      {isCreatingBookmark ? (
        <div
          style={{
            display: 'flex',
            marginLeft: "10px"
          }}
        >
          <Spinner />
        </div>
      ) : (
        <div className='saveSearchIconHolder'>
          <img
            onClick={handleBookmarkCreate}
            src="images/bookmarkIcon.svg"
            alt="bookmark icon"
            className="saveSearchIcon"
          />
           {isOnboardingBookmark && index === 0 && (
              <OnboardingModal 
                style={{ 
                  display: "block", 
                  position: "absolute", 
                  top: "130px", 
                  right: "-120px",
                  zIndex: 9999
                }}
                tipPosition="topRight"
              />
            )}
        </div>
      )}
    </div>
  );
};

export default GoogleScreen;