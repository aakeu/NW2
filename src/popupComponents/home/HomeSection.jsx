import React, { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { debounce } from 'lodash';
import {
  setEngineState,
  setPhaseCacheState,
  setQueryState,
  setGoogleStoredQuery,
  setScholarStoredQuery,
  setFromExtraction,
} from '../../popupState/slice/browserSlice'
import '../home/HomeSection.css'
import SearchEngineOption from './SearchEngineOption'
import SearchResults from '../searchResult/SearchResults'
import {
  getExtractedQuery,
  getGooglePhaseCache,
  getGoogleScholarPhaseCache,
  getGSearchValue,
  getScholarStoredQuery,
  getStoredQuery,
  getUseExtraction,
  Spinner,
} from '../../utils/utility'
import { google_scholar, google_search } from '../../api/google_api'
import GoogleScholarResults from '../searchResult/GoogleScholarResults'
import Paginator from '../searchResult/Paginator'
import ReusableFolderContents from '../reusableFolder/ReusableFolderContents'
import Backdrop from '../backdrop/Backdrop'
import PaymentModal from '../paymentModal/PaymentModal'
import OnboardingVideo from '../onboarding/OnboardingVideo'
import ReusableOnboardingModal from '../onboarding/ReusableOnboardingModal'

export default function HomeSection({
  userDetail,
  setShowFolderModal,
  allFolders,
  trackingRecord,
  showOnboarding,
  setShowOnboarding,
  isModalOpen,
  setIsModalOpen,
  isQuickSearchLogoDesc,
  isSelectSearchEngineDesc,
  isCarryOutSearchDesc,
  isOpenInANewTabDesc,
  isGptToggleDesc,
  isVisitSiteDesc,
  isSelectFolderForBookmarkDesc,
  isBookmarkDesc,
  isMenuSideDesc,
  setIsQuickSearchLogoDesc,
  handleOnboardingNext,
  handleOnboardingBack,
  defaultQuery,
  isChecked,
}) {
  const [showSearchEngineOption, setShowSearchEngineOption] = useState(false)
  const [searchEngine, setSearchEngine] = useState('Google')
  const [selectedFolder, setSelectedFolder] = useState(null)
  const hideTimeoutRef = useRef(null)
  const {
    query,
    engine,
    googlePhaseCache,
    scholarPhaseCache,
    googleStoredQuery,
    scholarStoredQuery,
    fromExtraction,
  } = useSelector((state) => state.browser)

  const [searching, setSearching] = useState(false)
  const [searchRes, setSearchRes] = useState([])
  const [folderOpen, setFolderOpen] = useState(false)
  const [activationNeeded, setActivationNeeded] = useState(false)
  const [paymentModalInfo, setPaymentModalInfo] = useState(null)
  const dispatch = useDispatch()

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

  const handleSelectFolder = (folder) => {
    setSelectedFolder(folder)
    setFolderOpen(false)
  }

  const handleFolderOpen = (event) => {
    event.stopPropagation()
    setFolderOpen((prev) => !prev)
  }

  const handleNextPhase = (next_phase) => {
    handleSearch(next_phase, searchEngine)
    dispatch(setPhaseCacheState({ engine: searchEngine, phase: next_phase }))
  }

  const handleSearch = async (phase, eng = searchEngine) => {
    try {
      const mainEng = eng
      setSearching(true)

      const query_to_lower_case =
        mainEng === 'Google'
          ? googleStoredQuery.toLowerCase().trim()
          : scholarStoredQuery.toLowerCase().trim()
      let gSearchValue = await getGSearchValue()

      if (!gSearchValue) {
        const initialCache = {
          Google: {},
          GoogleScholar: {},
        }
        chrome.storage.local.set(
          { 'g-search': JSON.stringify(initialCache) },
          () => {
            if (chrome.runtime.lastError) {
              console.log('Error setting initial g-search cache')
            }
          },
        )
        gSearchValue = JSON.stringify(initialCache)
      }

      const g_search =
        typeof gSearchValue === 'string'
          ? JSON.parse(gSearchValue)
          : gSearchValue

      if (!g_search[mainEng]) {
        g_search[mainEng] = {}
      }

      if (
        g_search[`${mainEng}`][query_to_lower_case] &&
        g_search[`${mainEng}`][query_to_lower_case][`${phase}`]
      ) {
        const { data, ttl } =
          g_search[`${mainEng}`][query_to_lower_case][`${phase}`]
        if (Date.now() <= new Date(ttl).getTime()) {
          setSearchRes(data)
          setSearching(false)
          return
        }
      }

      const regex = /^\s+$/gi
      if (query_to_lower_case && !regex.test(query_to_lower_case)) {
        const res =
          mainEng === 'Google'
            ? await google_search(query_to_lower_case, phase)
            : await google_scholar(query_to_lower_case, phase, true)

        const oneDayLater = Date.now() + 24 * 60 * 60 * 1000

        const queryCache = g_search[`${mainEng}`][query_to_lower_case] || {}
        g_search[`${mainEng}`][query_to_lower_case] = {
          ...queryCache,
          [phase]: { data: res, ttl: oneDayLater },
        }

        if (mainEng === 'Google') {
          chrome.storage.local.set(
            {
              'g-search': JSON.stringify(g_search),
              storedQuery: query_to_lower_case,
              googlePhaseCache: phase,
              useExtraction: false,
            },
            function () {
              dispatch(setGoogleStoredQuery({ query: query_to_lower_case }))
              setSearchRes(res)
              setSearching(false)
            },
          )
        }
        if (mainEng === 'GoogleScholar') {
          chrome.storage.local.set(
            {
              'g-search': JSON.stringify(g_search),
              scholarStoredQuery: query_to_lower_case,
              googleScholarPhaseCache: phase,
            },
            function () {
              dispatch(setScholarStoredQuery({ query: query_to_lower_case }))
              setSearchRes(res)
              setSearching(false)
            },
          )
        }
      } else {
        setSearchRes([])
        setSearching(false)
      }
    } catch (error) {
      setSearching(false)
      // console.error(error)
    }
  }

  useEffect(() => {
    async function getSavedResults() {
      let gSearchValue = await getGSearchValue()
      const storedQuery = await getStoredQuery()
      const scholarStoredQuery = await getScholarStoredQuery()
      const googlePhaseCache = await getGooglePhaseCache()
      const googleScholarPhaseCache = await getGoogleScholarPhaseCache()

      if (gSearchValue) {
        const g_search =
          typeof gSearchValue === 'string'
            ? JSON.parse(gSearchValue)
            : gSearchValue

        if (searchEngine === 'Google') {
          if (
            g_search[`${searchEngine}`] &&
            g_search[`${searchEngine}`][storedQuery] &&
            g_search[`${searchEngine}`][storedQuery][`${googlePhaseCache}`]
          ) {
            const { data, ttl } =
              g_search[`${searchEngine}`][storedQuery][`${googlePhaseCache}`]
            if (Date.now() <= new Date(ttl).getTime()) {
              setSearchRes(data)
              return
            }
          }
          setSearchRes([])
        } else if (searchEngine === 'GoogleScholar') {
          if (
            g_search[`${searchEngine}`] &&
            g_search[`${searchEngine}`][scholarStoredQuery] &&
            g_search[`${searchEngine}`][scholarStoredQuery][
              `${googleScholarPhaseCache}`
            ]
          ) {
            const { data, ttl } =
              g_search[`${searchEngine}`][scholarStoredQuery][
                `${googleScholarPhaseCache}`
              ]
            if (Date.now() <= new Date(ttl).getTime()) {
              setSearchRes(data)
              return
            }
          }
          setSearchRes([])
        }
      } else {
        setSearchRes([])
      }
    }
    getSavedResults()
  }, [searchEngine, googlePhaseCache, scholarPhaseCache])

  const handleEnter = (e) => e.key == 'Enter' && handleNextPhase(1)

  const handleSearchEngine = async (engine) => {
    if (engine === 'GoogleScholar' && !userDetail.user.isSubscribed) {
      setActivationNeeded(true)
      setPaymentModalInfo(
        'With your current plan, you can only use the selected search engine. Upgrade your plan to access additional search engines and enhance your browsing experience!',
      )
      return
    }
    setSearchEngine(engine)
    dispatch(setEngineState(engine))

    if (engine === 'Google') {
      const storedQuery = await getStoredQuery()
      const googlePhaseCacheValue = await getGooglePhaseCache()
      chrome.storage.local.set(
        {
          isGoogle: true,
          isGoogleScholar: false,
          storedQuery: storedQuery,
          googlePhaseCache: googlePhaseCacheValue || 1,
        },
        function () {
          dispatch(
            setPhaseCacheState({
              engine: 'Google',
              phase: googlePhaseCacheValue || 1,
            }),
          )
          dispatch(setQueryState({ query: storedQuery || '' }))
          setShowSearchEngineOption(false)
          handleSearch(googlePhaseCacheValue || 1, 'Google')
        },
      )
    } else if (engine === 'GoogleScholar') {
      const scholarStoredQuery = await getScholarStoredQuery()
      const googleScholarPhaseCacheValue = await getGoogleScholarPhaseCache()
      chrome.storage.local.set(
        {
          isGoogle: false,
          isGoogleScholar: true,
          scholarStoredQuery: scholarStoredQuery,
          googleScholarPhaseCache: googleScholarPhaseCacheValue || 1,
        },
        function () {
          dispatch(
            setPhaseCacheState({
              engine: 'GoogleScholar',
              phase: googleScholarPhaseCacheValue || 1,
            }),
          )
          dispatch(setQueryState({ query: scholarStoredQuery || '' }))
          setShowSearchEngineOption(false)
          handleSearch(googleScholarPhaseCacheValue || 1, 'GoogleScholar')
        },
      )
    }
  }

  const handleShowSearchEngineOption = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
    }
    setShowSearchEngineOption(true)
  }

  const handleHideSearchEngineOption = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setShowSearchEngineOption(false)
    }, 200)
  }

  useEffect(() => {
    chrome.storage.local.get(
      [
        'isGoogle',
        'isGoogleScholar',
        'googlePhaseCache',
        'googleScholarPhaseCache',
      ],
      async function (result) {
        const isGoogle = result.isGoogle
        const isGoogleScholar = result.isGoogleScholar
        const googlePhaseCacheValue = result.googlePhaseCache || 1
        const googleScholarPhaseCacheValue = result.googleScholarPhaseCache || 1

        if (isGoogle) {
          const storedQuery = await getStoredQuery()
          setSearchEngine('Google')
          dispatch(setEngineState('Google'))
          dispatch(
            setPhaseCacheState({
              engine: 'Google',
              phase: googlePhaseCacheValue,
            }),
          )
          dispatch(setGoogleStoredQuery({ query: storedQuery || '' }))
          dispatch(setQueryState({ query: storedQuery || '' }))
        } else if (isGoogleScholar) {
          const scholarStoredQuery = await getScholarStoredQuery()
          setSearchEngine('GoogleScholar')
          dispatch(setEngineState('GoogleScholar'))
          dispatch(
            setPhaseCacheState({
              engine: 'GoogleScholar',
              phase: googleScholarPhaseCacheValue,
            }),
          )
          dispatch(setScholarStoredQuery({ query: scholarStoredQuery || '' }))
          dispatch(setQueryState({ query: scholarStoredQuery || '' }))
        } else {
          setSearchEngine('Google')
          dispatch(setEngineState('Google'))
          dispatch(setPhaseCacheState({ engine: 'Google', phase: 1 }))
          dispatch(setGoogleStoredQuery({ query: '' }))
          dispatch(setQueryState({ query: '' }))
        }
      },
    )
  }, [])

  useEffect(() => {
    async function performSearchOnPageChange() {
      if (searchEngine === 'Google') {
        // const storedQuery = await getStoredQuery()
        // if (storedQuery) {
        //   dispatch(setQueryState({ query: storedQuery }))
        //   handleSearch(googlePhaseCache, 'Google')
        // }
        if (isCarryOutSearchDesc && defaultQuery) {
          dispatch(setQueryState({ query: defaultQuery }))
          handleSearch(1, 'Google')
        }
      }
      // if (searchEngine === 'GoogleScholar') {
      //   const scholarStoredQuery = await getScholarStoredQuery()
      //   if (scholarStoredQuery) {
      //     dispatch(setQueryState({ query: scholarStoredQuery }))
      //     handleSearch(scholarPhaseCache, 'GoogleScholar')
      //   }
      // }
    }
    performSearchOnPageChange()
  }, [searchEngine, googlePhaseCache, scholarPhaseCache, defaultQuery])

  useEffect(() => {
    const performExtraction = async () => {
      try {
        const extract = await getExtractedQuery();
        if (extract) {
          const { searchQuery, isGoogle, isGoogleScholar, dateAdded, isUsed } = extract;
          const savedDate = new Date(dateAdded);
          const currentTime = new Date();
          const timeDifferenceHours =
            (currentTime.getTime() - savedDate.getTime()) / (1000 * 60 * 60);

          if (timeDifferenceHours <= 1) {
            const engine = isGoogle ? 'Google' : 'GoogleScholar';
            setSearchEngine(engine); // Sync local state
            dispatch(setEngineState(engine)); // Sync Redux state
            if (isGoogle) {
              dispatch(setGoogleStoredQuery({ query: searchQuery }));
              dispatch(setQueryState({ query: searchQuery }));
              chrome.storage.local.set(
                {
                  isGoogle: true,
                  isGoogleScholar: false,
                  storedQuery: searchQuery,
                  googlePhaseCache: 1,
                  useExtraction: true,
                  extractedGoogleQueryDetails: { ...extract, isUsed: true },
                },
                () => {
                  dispatch(setPhaseCacheState({ engine: 'Google', phase: 1 }));
                  handleSearch(1, 'Google');
                },
              );
            } else if (isGoogleScholar) {
              dispatch(setScholarStoredQuery({ query: searchQuery }));
              dispatch(setQueryState({ query: searchQuery }));
              chrome.storage.local.set(
                {
                  isGoogle: false,
                  isGoogleScholar: true,
                  scholarStoredQuery: searchQuery,
                  googleScholarPhaseCache: 1,
                  useExtraction: true,
                  extractedScholarQueryDetails: { ...extract, isUsed: true },
                },
                () => {
                  console.log('Triggering search for GoogleScholar:', searchQuery);
                  dispatch(setPhaseCacheState({ engine: 'GoogleScholar', phase: 1 }));
                  handleSearch(1, 'GoogleScholar');
                },
              );
            }
          } else {
            console.log('Query too old:', searchQuery);
          }
        } else {
          console.log('No extracted query found');
        }
      } catch (error) {
        console.error('Error during extraction in popup:', error);
      }
    };

    performExtraction();

    // Listen for new queries from background.js
    const messageListener = (message) => {
      if (message.action === 'newQueryAvailable') {
        performExtraction();
      }
    };
    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, [dispatch]);

  return (
    <>
      <div className="homeSection">
        {userDetail && userDetail?.user && (
          <div className="homeWelcome">
            Welcome{' '}
            <span className="homeWelcomeSecName">
              {userDetail?.user?.name}!
            </span>
          </div>
        )}
        <div className="homeSectionSearchHolder">
          <div
            className="googleAndScholarIconHolder"
            onMouseEnter={handleShowSearchEngineOption}
            onMouseLeave={handleHideSearchEngineOption}
          >
            {userDetail && userDetail?.token ? (
              <img
                src={
                  searchEngine === 'GoogleScholar'
                    ? 'images/popup/googleScholarIcon.svg'
                    : 'images/popup/googleIcon.svg'
                }
                alt="searchEngineIcon"
                className="googleAndScholarIcon"
              />
            ) : (
              <img
                src={'images/popup/googleIcon.svg'}
                alt="searchEngineIcon"
                className="googleAndScholarIcon"
              />
            )}
            <img src="images/popup/line.png" alt="line" className="lineIcon" />
          </div>
          <input
            type="text"
            className="homeSectionInput"
            placeholder="Search here..."
            onKeyUp={handleEnter}
            value={
              searchEngine === 'Google' ? googleStoredQuery : scholarStoredQuery
            }
            onChange={({ target: { value } }) => {
              if (searchEngine === 'Google') {
                dispatch(setGoogleStoredQuery({ query: value }))
              } else {
                dispatch(setScholarStoredQuery({ query: value || '' }))
              }
            }}
          />
          {searching ? (
            <Spinner />
          ) : (
            <button
              className="searchBtnHolder"
              onClick={() => handleNextPhase(1)}
            >
              Search
              <img
                src="images/popup/searchSendIcon.svg"
                alt="search"
                className="searchSendIcon"
              />
            </button>
          )}
          {showSearchEngineOption && (
            <SearchEngineOption
              onMouseEnter={handleShowSearchEngineOption}
              onMouseLeave={handleHideSearchEngineOption}
              handleSearchEngine={handleSearchEngine}
              searchEngine={searchEngine}
              userDetail={userDetail}
            />
          )}
        </div>
        {userDetail && userDetail.token && (
          <>
            <div className="homeBookmarkLocation">
              <img
                src="images/popup/folderIcon.svg"
                alt="folder"
                className="folderIcon"
                onClick={handleShowFolderModal}
              />
              Bookmarks{' '}
              <span className="homeBookmarkLocationText">Location</span>
            </div>
            <ReusableFolderContents
              handleFolderOpen={handleFolderOpen}
              selectedFolder={selectedFolder}
              folderOpen={folderOpen}
              setFolderOpen={setFolderOpen}
              allFolders={allFolders}
              handleSelectFolder={handleSelectFolder}
              isMarginLeft={true}
              placedOnTop={false}
            />
          </>
        )}
        {searchRes.length > 0 && !searching ? (
          <>
            <span className="searchResultsTotal">40 Results</span>
            {engine === 'Google'
              ? searchRes.map((res) => (
                  <SearchResults
                    key={res.link}
                    result={res}
                    selectedFolder={selectedFolder}
                    userDetail={userDetail}
                    trackingRecord={trackingRecord}
                    isChecked={isChecked}
                  />
                ))
              : engine === 'GoogleScholar'
              ? searchRes.map((res) => (
                  <GoogleScholarResults
                    key={res.link}
                    result={res}
                    selectedFolder={selectedFolder}
                    isChecked={isChecked}
                  />
                ))
              : searchRes.map((res) => (
                  <SearchResults
                    key={res.link}
                    result={res}
                    selectedFolder={selectedFolder}
                    userDetail={userDetail}
                    trackingRecord={trackingRecord}
                    isChecked={isChecked}
                  />
                ))}
            <Paginator
              phase={engine === 'Google' ? googlePhaseCache : scholarPhaseCache}
              nextPhase={handleNextPhase}
              searchEngine={searchEngine}
            />
          </>
        ) : (
          <div className="">
            {searching ? (
              <p className="searchingResults">Searching...</p>
            ) : (
              <p className="searchResultsAppearHere">
                {' '}
                Search results appear here...
              </p>
            )}
          </div>
        )}
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
      {userDetail && userDetail.token && showOnboarding && (
        <>
          <Backdrop />
          <OnboardingVideo
            setShowOnboarding={setShowOnboarding}
            setIsModalOpen={setIsModalOpen}
            setIsQuickSearchLogoDesc={setIsQuickSearchLogoDesc}
          />
        </>
      )}
      {isModalOpen && (
        <>
          <Backdrop />
          <ReusableOnboardingModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            top={
              isQuickSearchLogoDesc
                ? 70
                : isSelectSearchEngineDesc
                ? 200
                : isCarryOutSearchDesc
                ? 200
                : isOpenInANewTabDesc
                ? 320
                : isGptToggleDesc
                ? 67
                : isVisitSiteDesc
                ? 250
                : isSelectFolderForBookmarkDesc
                ? 280
                : isBookmarkDesc
                ? 195
                : isMenuSideDesc
                ? 67
                : 70
            }
            left={
              isQuickSearchLogoDesc
                ? 0
                : isSelectSearchEngineDesc
                ? 70
                : isCarryOutSearchDesc
                ? 290
                : isOpenInANewTabDesc
                ? 0
                : isGptToggleDesc
                ? 350
                : isVisitSiteDesc
                ? 70
                : isSelectFolderForBookmarkDesc
                ? 350
                : isBookmarkDesc
                ? 350
                : isMenuSideDesc
                ? 390
                : 70
            }
            tooltipPosition={
              isQuickSearchLogoDesc
                ? 'top'
                : isSelectSearchEngineDesc
                ? 'top'
                : isCarryOutSearchDesc
                ? 'top'
                : isOpenInANewTabDesc
                ? 'bottom'
                : isGptToggleDesc
                ? 'top'
                : isVisitSiteDesc
                ? 'bottom'
                : isSelectFolderForBookmarkDesc
                ? 'top'
                : isBookmarkDesc
                ? 'bottom'
                : isMenuSideDesc
                ? 'top'
                : 'top'
            }
            tooltipTopLeft={
              isQuickSearchLogoDesc
                ? '20%'
                : isSelectSearchEngineDesc
                ? '20%'
                : isCarryOutSearchDesc
                ? '70%'
                : isGptToggleDesc
                ? '80%'
                : isSelectFolderForBookmarkDesc
                ? '72%'
                : isMenuSideDesc
                ? '95%'
                : '20%'
            }
            tooltipBottomLeft={
              isOpenInANewTabDesc
                ? '10%'
                : isVisitSiteDesc
                ? '30%'
                : isBookmarkDesc
                ? '85%'
                : '50%'
            }
            handleOnboardingNext={handleOnboardingNext}
            handleOnboardingBack={handleOnboardingBack}
          >
            {isQuickSearchLogoDesc && <h4>Quick Search Logo</h4>}
            {isSelectSearchEngineDesc && <h4>Select your search engine</h4>}
            {isCarryOutSearchDesc && <h4>Carry out a Search</h4>}
            {isOpenInANewTabDesc && <h4>Open in a new tab</h4>}
            {isGptToggleDesc && <h4>GPT Toggle</h4>}
            {isVisitSiteDesc && <h4>Visit Site</h4>}
            {isSelectFolderForBookmarkDesc && (
              <h4>Select a folder for a bookmark</h4>
            )}
            {isBookmarkDesc && <h4>Bookmark</h4>}
            {isMenuSideDesc && <h4>Menu Side</h4>}
            {isQuickSearchLogoDesc && (
              <p>
                Welcome to QuickSearch+! Anytime you need to return to your
                starting point, just click the logo. It’s your quick way back
                home, no matter where you are.
              </p>
            )}
            {isSelectSearchEngineDesc && (
              <p>
                Select Your Search Engine! Whether you're looking for general
                web results or academic papers, easily switch between Google and
                Google Scholar to get the most relevant results for your search.
              </p>
            )}
            {isCarryOutSearchDesc && (
              <p>
                Try It Out! Enter your search term and see how your results
                display directly in the extension. Experience the convenience of
                browsing without leaving your page!
              </p>
            )}
            {isOpenInANewTabDesc && (
              <p>
                Control Your Browsing! Use the 'Open in New Tab' option to
                decide where your clicked web link appears. Tick the box for a
                new tab or leave it unticked to stay on the current page
              </p>
            )}
            {isGptToggleDesc && (
              <p>
                Unlock AI Power! Toggle the GPT function to switch from keyword
                searches to natural language queries. Ask questions, get
                answers—right within QuickSearch+.
              </p>
            )}
            {isVisitSiteDesc && (
              <p>
                Get Instant Insights! Hover over the 'Visit Site' label for 3
                seconds to reveal a quick, informative summary of the webpage—no
                clicks needed, just pure convenience.
              </p>
            )}
            {isSelectFolderForBookmarkDesc && (
              <p>
                Organize with Ease! Step 1: Select a folder or leave it
                unselected to decide where your URL will be saved. A simple
                click on the bookmark icon does the rest!
              </p>
            )}
            {isBookmarkDesc && (
              <p>
                Finalize Your Bookmark! Click the bookmark to save it to your
                chosen folder. Your favorite links are now just a click away!
              </p>
            )}
            {isMenuSideDesc && (
              <p>
                Explore More Options: Hover over the profile icon (Hamburger
                menu) to reveal additional features. Click on 'Dashboard' to
                view all your bookmarked items and more, all in one place!
              </p>
            )}
          </ReusableOnboardingModal>
        </>
      )}
    </>
  )
}
