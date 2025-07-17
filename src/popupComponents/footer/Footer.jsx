import React, { useState } from 'react'
import '../footer/Footer.css'
import { backToHomeSection } from '../../utils/sectionManagement'
import { getChromeStorage, setChromeStorage } from '../../utils/utility'

export default function Footer({
  isChecked,
  setIsChecked,
  setShowOnboarding,
  handleBackToHomeOnboardingState,
  userDetail,
}) {
  const handleCheckboxChange = async (event) => {
    const openInNewTabState = await getChromeStorage('openInANewTab')
    if (openInNewTabState) {
      await setChromeStorage({ openInANewTab: false })
      if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ type: 'OPEN_IN_NEW_TAB' })
      }
    } else {
      await setChromeStorage({ openInANewTab: true })
      if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ type: 'OPEN_IN_NEW_TAB' })
      }
    }
  }

  return (
    <div className="footer">
      <div className="footerOpenInTabHolder">
        <label
          style={{
            display: 'inline-block',
            position: 'relative',
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            className="footerOpenTabCheck"
            checked={isChecked}
            onChange={handleCheckboxChange}
          />
          <span className="custom-checkbox"></span>
        </label>
        <span className="footerOpenTabText">Open in a new tab</span>
      </div>
      {userDetail && userDetail.token && (
        <span
          onClick={() => {
            backToHomeSection()
            setShowOnboarding(true)
            handleBackToHomeOnboardingState()
          }}
          className="footerOnboarding"
        >
          Start tour
        </span>
      )}
      <span className="footerCopyright">© 2025 Quick Search+</span>
    </div>
  )
}
