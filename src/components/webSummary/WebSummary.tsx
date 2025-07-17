import React from 'react'
import '../webSummary/WebSummary.css'

interface WebSummaryProps {
  result: string | null
  isLoading: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
  webSummaryError: string | null
}

const WebSummary: React.FC<WebSummaryProps> = ({
  result,
  isLoading,
  onMouseEnter,
  onMouseLeave,
  webSummaryError,
}) => {
  return (
    <div
      className="webSummary"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <span className="webSummaryHolder">
        {isLoading && (
          <span className="websummaryLoading">
            Searching for web summary. Please wait...
          </span>
        )}
        {result && (
          <>
            <span className="webSummaryCaption">Web Summary</span>
            <span className="webSummaryDesc">{result}</span>
          </>
        )}
        {webSummaryError && (
          <p
            style={{
              color: 'red',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            Something went wrong. Please try again!
          </p>
        )}
      </span>
    </div>
  )
}

export default WebSummary
