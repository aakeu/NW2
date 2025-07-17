import React, { useRef, useEffect } from 'react'
import '../gpt/GptSection.css'
import GptMoreFeaturesModal from './GptMoreFeaturesModal'
import { handleFeatures, MoreFeatures } from '../../utils/utility'

export default function GptHeader({
  setIsFullSidebar,
  isFullSidebar,
  gptSubSection,
}) {
  const { handleOpenMoreFeatures, openMoreFeatures, setOpenMoreFeatures } =
    handleFeatures()

  const moreFeaturesTimeoutRef = useRef(null)

  const handleMoreFeaturesOutsideClick = (event) => {
    if (
      moreFeaturesTimeoutRef.current &&
      !moreFeaturesTimeoutRef.current.contains(event.target)
    ) {
      setOpenMoreFeatures(false)
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleMoreFeaturesOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleMoreFeaturesOutsideClick)
    }
  }, [])

  return (
    <>
      <div
        className={
          isFullSidebar
            ? 'chatGptMainHeaderHolderExtra'
            : 'chatGptMainHeaderHolder'
        }
      >
        <div className="chatGptMainHeader">
          <img
            src={'images/popup/hamburger.svg'}
            alt="hamburger"
            className="chatGptHamburgerIcon"
            onClick={() => setIsFullSidebar(!isFullSidebar)}
          />
          <img
            src={'images/popup/chatProfileIcon.svg'}
            alt="chat profile icon"
            className="chatGptProfileIcon"
          />
          <div className="chatGptHeaderTextHolder">
            <span className="chatGptHeaderCaption">GPT</span>
            <span className="chatGptHeaderCaptionDesc">
              Search with GPT and get quick response
            </span>
          </div>
        </div>
        <MoreFeatures text={'More Features'} onClick={handleOpenMoreFeatures} />
        {openMoreFeatures && (
          <GptMoreFeaturesModal
            ref={moreFeaturesTimeoutRef}
            gptSubSection={gptSubSection}
          />
        )}
      </div>
    </>
  )
}
