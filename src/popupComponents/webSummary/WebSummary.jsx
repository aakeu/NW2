import React from 'react'
import '../webSummary/WebSummary.css'

export default function WebSummary({
  onMouseEnter,
  onMouseLeave,
  result,
  isLoading,
}) {
  return (
    <div
      className="webSummary"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <span className="webSummaryHolder">
        {isLoading ? (
          <span className="websummaryLoading">
            Searching for web summary. Please wait...
          </span>
        ) : (
          <>
            <span className="webSummaryCaption">Web Summary</span>
            <span className="webSummaryDesc">{result}</span>
          </>
        )}
      </span>
    </div>
  )
}
