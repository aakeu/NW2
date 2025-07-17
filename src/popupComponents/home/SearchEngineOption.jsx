import React from 'react'

export default function SearchEngineOption({
  onMouseEnter,
  onMouseLeave,
  handleSearchEngine,
  searchEngine,
  userDetail,
}) {
  return (
    <div
      className="searchEngineOption"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="searchEngineOptionContents">
        <div
          className="googleOptionHolder"
          onClick={() => handleSearchEngine('Google')}
          style={
            searchEngine === 'Google'
              ? {
                  backgroundColor: '#eef1f9',
                  borderRadius: '6px',
                  transition: '0.5s ease-in-out',
                }
              : {}
          }
        >
          <img
            src="images/popup/googleIcon.svg"
            alt="googleIcon"
            className="googleOptionHolderIcon"
          />
          <span className="googleText">Google</span>
        </div>
        {userDetail && userDetail?.token && (
          <div
            className="googleScholarOptionHolder"
            onClick={() => handleSearchEngine('GoogleScholar')}
            style={
              searchEngine === 'GoogleScholar'
                ? {
                    backgroundColor: '#eef1f9',
                    borderRadius: '6px',
                    transition: '0.5s ease-in-out',
                  }
                : {}
            }
          >
            <img
              src="images/popup/googleScholarIcon.svg"
              alt="googleScholarIcon"
              className="googleScholarOptionHolderIcon"
            />
            <span className="googleScholarText">Google Scholar</span>
          </div>
        )}
      </div>
    </div>
  )
}
