import React, { useEffect } from 'react'
import './Footer.css'
import { AppDispatch, RootState } from '../../state'
import { useDispatch, useSelector } from 'react-redux'
import {
  initializeOpenNewTab,
  toggleOpenInNewTab,
} from '../../state/slice/openInNewTabSlice'
import ThemeToggle from '../theme/ThemeToggle'
import { setActiveSection } from '../../state/slice/sectionSlice'
import { setIsOnboardingHomeLogo, setIsOnboardingVideo, setShowOnboardingModal } from '../../state/slice/reusableStatesSlice'

const Footer: React.FC = () => {
  const openInNewTab = useSelector(
    (state: RootState) => state.openInNewTab.openInNewTab,
  )
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode)
  const { token } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch<AppDispatch>()

  const handleOpenInTab = () => {
    dispatch(toggleOpenInNewTab(!openInNewTab))
  }

  useEffect(() => {
    dispatch(initializeOpenNewTab())
  }, [dispatch])

  return (
    <div className={isDarkMode ? 'footerDark' : 'footer'}>
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
            checked={openInNewTab}
            onChange={handleOpenInTab}
          />
          <span className="custom-checkbox"></span>
        </label>
        <span
          className={isDarkMode ? 'footerOpenTabTextDark' : 'footerOpenTabText'}
        >
          Open in a new tab
        </span>
      </div>
      <ThemeToggle />
      {token && (
        <span
          onClick={() => {
            dispatch(setActiveSection('homeSection')) 
            dispatch(setIsOnboardingVideo(true))
          }}
          className={isDarkMode ? "footerOnboardingDark" : "footerOnboarding"}
        >
          Start tour
        </span>
      )}
      <span className={isDarkMode ? 'footerCopyrightDark' : 'footerCopyright'}>
        © 2025 Quick Search+
      </span>
    </div>
  )
}

export default Footer
