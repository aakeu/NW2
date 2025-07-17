import React, { useEffect, useRef, useState } from 'react';
import './Search.css';
import { AppDispatch, RootState } from '../../state';
import { useDispatch, useSelector } from 'react-redux';
import { initializeSearchEngineOption } from '../../state/slice/searchEngineOptionSlice';
import {
  fetchGoogleScholarSearch,
  fetchGoogleSearch,
  initializeSearchState,
  setPage,
  setQuery,
} from '../../state/slice/searchSlice';
import SearchEngineOption from './SearchEngineOption';
import { Spinner } from '../spinner/Spinner';
import {
  setActivationNeeded,
  setPaymentModalInfo,
  setShowFolderModal,
} from '../../state/slice/reusableStatesSlice';
import ReusableFolderContents from '../reusableFolder/ReusableFolderContents';
import { fetchTracking } from '../../state/slice/trackingSlice';
import { ExtractedQuery, getExtractedQuery } from '../../utils/siderUtility/siderUtility';
import OnboardingModal from '../onboarding/Onboarding';
import { useNotification } from '../notification/NotificationContext';

const Search: React.FC = () => {
  const [showSearchEngineOption, setShowSearchEngineOption] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });
  const { createNotification } = useNotification();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const searchEngine = useSelector(
    (state: RootState) => state.searchEngineOption.searchEngine,
  );
  const { queries, currentPage, loading } = useSelector(
    (state: RootState) => state.search,
  );
  const { token, user } = useSelector((state: RootState) => state.auth);
  const { isOnboardingSearchPanel, 
    isOnboardingSelectSearchEngine, 
    isOnboardingCarryoutASearch, showOnboardingModal } = useSelector((state: RootState) => state.reusable)
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const queryForEngine = queries[searchEngine];
    setInputValue(queryForEngine || '');
  }, [searchEngine, queries]);

  useEffect(() => {
    const showNotification = (message: string, type: string) => {
      createNotification({
        message,
        duration: 5000,
        background: type === 'success' ? 'green' : type === 'warning' ? '#17a2b8' : 'red',
        color: '#fff',
      });
    };
    if (notification.message) {
      showNotification(notification.message, notification.type);
    }
  }, [notification]);

  
  useEffect(() => {
    if (isOnboardingCarryoutASearch && queries[searchEngine]) {
        handleSearch(queries[searchEngine]);
    }
  }, [isOnboardingCarryoutASearch, queries, searchEngine]);

  const handleShowFolderModal = async () => {
    try {
      const tracking = await dispatch(fetchTracking()).unwrap();
      const numberOfFolders = tracking?.numberOfFolders ?? 0;
      console.log({
        numberOfFolders,
        user
      })
  
      if (numberOfFolders >= 5 && !user?.isSubscribed) {
        dispatch(setActivationNeeded(true));
        dispatch(
          setPaymentModalInfo(
            "You have reached the 5-folder limit for a free plan. Upgrade your plan to create more folders!"
          )
        );
      } else {
        dispatch(setShowFolderModal(true));
      }
    } catch (error) {
      // console.error("Error in handleShowFolderModal:", error);
      setNotification({
        message: "Failed to check folder limit. Please try again.",
        type: "error",
      });
    }
  };

  const handleShowSearchEngineOption = () => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    setShowSearchEngineOption(true);
  };

  const handleHideSearchEngineOption = () => {
    hideTimeoutRef.current = setTimeout(
      () => setShowSearchEngineOption(false),
      200,
    );
  };

  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || inputValue;
    if (!finalQuery) return;
    dispatch(setQuery({ query: finalQuery, engine: searchEngine }));
    if (searchEngine === 'Google') {
      dispatch(fetchGoogleSearch({ query: finalQuery, phase: currentPage || 1 }));
    } else if (searchEngine === 'GoogleScholar') {
      dispatch(fetchGoogleScholarSearch({ query: finalQuery, phase: currentPage || 1 }));
    }
  };

  useEffect(() => {
    const performExtraction = async () => {
      try {
        const extract = await getExtractedQuery();
        if (extract && !extract.isUsed) {
          const { searchQuery, isGoogle, isGoogleScholar, dateAdded } = extract;
          const savedDate = new Date(dateAdded);
          const currentTime = new Date();
          const timeDifferenceHours =
            (currentTime.getTime() - savedDate.getTime()) / (1000 * 60 * 60);

          if (timeDifferenceHours <= 1) {
            const engine = isGoogle ? 'Google' : 'GoogleScholar';
            setInputValue(searchQuery);
            dispatch(setQuery({ query: searchQuery, engine }));
            dispatch(setPage(1));
            handleSearch(searchQuery);

            const storageKey = isGoogle
              ? 'extractedGoogleQueryDetails'
              : 'extractedScholarQueryDetails';
            chrome.storage.local.set(
              { [storageKey]: { ...extract, isUsed: true } },
              () => {
                // console.log('Query marked as used:', searchQuery);
              },
            );
          }
        }
      } catch (error) {
        // console.error('Error performing extraction:', error);
      }
    };

    performExtraction();

    const messageListener = (message: any) => {
      if (message.action === 'newQueryAvailable') {
        performExtraction();
      }
    };
    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, [dispatch]);

  // Initialize search state
  useEffect(() => {
    dispatch(initializeSearchState());
    dispatch(initializeSearchEngineOption());
  }, [dispatch]);

  return (
    <div className={isDarkMode ? 'searchDark' : 'searchLight'}>
      {token && (
        <div className="homeWelcome">
          <div className="homeWelcomeContainer">
            Welcome <span className="homeWelcomeSecName">{user?.name}!</span>
          </div>
        </div>
      )}
      <div className="searchEngineIconHolder">
        <div className='searchEngineIconHolderContainer'>
          <img
            src={
              searchEngine === 'Google'
                ? 'images/googleIcon.svg'
                : searchEngine === 'GoogleScholar'
                ? 'images/googleScholar.svg'
                : 'images/googleIcon.svg'
            }
            alt="Search"
            className="searchEngineIcon"
            onMouseEnter={handleShowSearchEngineOption}
            onMouseLeave={handleHideSearchEngineOption}
          />
          <img src="images/vertLine.svg" alt="Search" className="searchVertLine" />
          {token && showOnboardingModal && isOnboardingSelectSearchEngine && (
            <OnboardingModal 
              style={{ 
                display: "block", 
                position: "absolute", 
                top: "150px", 
                marginLeft: "100px"
              }}
              tipPosition="topLeft"
            />
          )}
        </div>
        <input
          type="text"
          className={isDarkMode ? 'searchInputDark' : 'searchInputLight'}
          placeholder="Search here..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        {token && showOnboardingModal && isOnboardingSearchPanel && (
          <OnboardingModal 
            style={{ 
              display: "block", 
              position: "absolute", 
              top: "150px", 
              left: "70%" 
            }}
            tipPosition="topCenter"
           />
        )}
      </div>
      {showSearchEngineOption && (
        <SearchEngineOption
          onMouseEnter={handleShowSearchEngineOption}
          onMouseLeave={handleHideSearchEngineOption}
        />
      )}
      {loading ? (
        <Spinner />
      ) : (
        <div className='searchBtnHolderContainer'>
          <button
            className={isDarkMode ? 'searchBtnHolderDark' : 'searchBtnHolderLight'}
            onClick={() => handleSearch()}
            disabled={loading}
          >
            Search
            <img src="images/searchSendIcon.svg" alt="search" className="searchSendIcon" />
          </button>
          {token && showOnboardingModal && isOnboardingCarryoutASearch && (
            <OnboardingModal 
              style={{ 
                display: "block", 
                position: "absolute", 
                top: "150px", 
                marginLeft: "-20px"
              }}
              tipPosition="topRight"
            />
          )}
        </div>
      )}
      {token && (
        <div className="homeBookmarkLocation">
          <div className="homeBookmarkLocationHolder">
            <img
              src="images/folderIcon.svg"
              alt="folder"
              className="folderIcon"
              onClick={handleShowFolderModal}
            />
            Bookmarks <span className="homeBookmarkLocationText">Location</span>
          </div>
          <ReusableFolderContents isMarginLeft={true} placedOnTop={false} />
        </div>
      )}
    </div>
  );
};

export default Search;