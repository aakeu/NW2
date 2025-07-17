import React, { useEffect } from 'react';
import './SearchResult.css';
import { AppDispatch, RootState } from '../../state';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchGoogleScholarSearch,
  fetchGoogleSearch,
  initializeSearchState,
  setPage,
} from '../../state/slice/searchSlice';
import GoogleScholarScreen from './GoogleScholarScreen';
import GoogleScreen from './GoogleScreen';

const SearchResults: React.FC = () => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const searchEngine = useSelector(
    (state: RootState) => state.searchEngineOption.searchEngine,
  );
  const { searchContainer, queries, currentPage, loading, error } = useSelector(
    (state: RootState) => state.search,
  );
  const { token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();

  const currentQuery = queries[searchEngine];
  const results =
    currentQuery && searchEngine === 'Google'
      ? searchContainer.Google[currentQuery]?.[currentPage] || []
      : currentQuery && searchEngine === 'GoogleScholar'
      ? searchContainer.GoogleScholar[currentQuery]?.[currentPage] || []
      : [];

  const itemsPerPage = 5;
  const totalPages = 8;

  const handlePageChange = (newPage: number) => {
    dispatch(setPage(newPage));
    if (currentQuery) {
      if (searchEngine === 'Google') {
        dispatch(fetchGoogleSearch({ query: currentQuery, phase: newPage }));
      } else if (searchEngine === 'GoogleScholar') {
        dispatch(fetchGoogleScholarSearch({ query: currentQuery, phase: newPage }));
      }
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await dispatch(initializeSearchState());
      const currentQueryForEngine = queries[searchEngine];
      if (currentQueryForEngine && !results.length) {
        handlePageChange(currentPage); // Trigger fetch or load cached data
      }
    };
    initialize();
  }, [dispatch]);

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 4;

    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`${isDarkMode ? 'pagination-buttonDark' : 'pagination-button'} ${
            currentPage === i ? 'active' : ''
          }`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>,
      );
    }

    return (
      <div className="pagination">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`${isDarkMode ? 'pagination-button-previousDark' : 'pagination-button-previous'} ${
            currentPage === 1 && isDarkMode
              ? 'previousDisableDark'
              : currentPage === 1 && !isDarkMode
              ? 'previousDisable'
              : ''
          }`}
        >
          {'<'}
        </button>
        {pages}
        {endPage < totalPages && (
          <span className="pagination-ellipses">...</span>
        )}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`${isDarkMode ? 'pagination-button-nextDark' : 'pagination-button-next'} ${
            currentPage === totalPages && isDarkMode
              ? 'nextDisableDark'
              : currentPage === totalPages && !isDarkMode
              ? 'nextDisable'
              : ''
          }`}
        >
          {'>'}
        </button>
      </div>
    );
  };

  return (
    <div className={token ? 'searchResults' : 'searchResultsWithNoToken'}>
      {error && <p>Something went wrong. Please try searching again...</p>}
      {loading ? (
        <p className={isDarkMode ? 'searchingResultsDark' : 'searchingResults'}>
          Searching...
        </p>
      ) : results.length > 0 ? (
        <>
          <span className={isDarkMode ? 'searchResultTotalDark' : 'searchResultTotal'}>
            40 Results
          </span>
          <div className="searchResultsHolder">
            {searchEngine === 'Google'
              ? results.map((searchResult, index) => (
                  <GoogleScreen
                    key={`${searchResult.title}-${index}`}
                    searchResult={searchResult}
                    index={index}
                  />
                ))
              : searchEngine === 'GoogleScholar'
              ? results.map((searchResult, index) => (
                  <GoogleScholarScreen
                    key={`${searchResult.title}-${index}`}
                    searchResult={searchResult}
                  />
                ))
              : results.map((searchResult, index) => (
                  <GoogleScreen
                    key={`${searchResult.title}-${index}`}
                    searchResult={searchResult}
                    index={index}
                  />
                ))}
          </div>
          {currentQuery && totalPages > 1 && renderPageNumbers()}
        </>
      ) : (
        <p
          className={
            isDarkMode ? 'searchResultsAppearHereDark' : 'searchResultsAppearHere'
          }
        >
          Search results appear here...
        </p>
      )}
    </div>
  );
};

export default SearchResults;