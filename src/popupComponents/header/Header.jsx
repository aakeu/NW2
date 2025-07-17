import React, { useState, useRef, useContext } from 'react'
import '../header/Header.css'
import ProfileMenuDropDown from './ProfileMenuDropDown'
import LoginModal from '../loginModal/LoginModal'
import Backdrop from '../backdrop/Backdrop'
import VerifyAccount from '../loginModal/VerifyAccount'
import {
  backToAllTabsSection,
  backToCurrentTabSection,
  backToGptSection,
  backToHomeSection,
} from '../../utils/sectionManagement'
import { getChromeStorage } from '../../utils/utility'

export default function Header({
  userDetail,
  allFolders,
  allBookmarks,
  isGptChecked,
}) {
  const [showProfileDropDown, setShowProfileDropDown] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [verifyAccount, setVerifyAccount] = useState(false)
  const hideTimeoutRef = useRef(null)

  const openVerifyAccount = () => {
    setVerifyAccount(true)
    setShowLoginModal(false)
  }
  const closeVerifyAccount = () => {
    setVerifyAccount(false)
    if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({
        type: 'ONBOARDING',
      })
    }
  }

  const handleShowProfileDropdown = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
    }
    setShowProfileDropDown(true)
  }

  const handleHideProfileDropdown = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setShowProfileDropDown(false)
    }, 200)
  }

  const handleGptSwitch = async () => {
    const gptState = await getChromeStorage('gptSection')
    if (gptState) {
      backToHomeSection()
    } else {
      backToGptSection()
    }
  }

  return (
    <>
      <div className="header">
        <div className="logoHolder" onClick={backToHomeSection}>
          <img src="images/popup/appheader.svg" alt="logo" className="logoImg" />
        </div>
        {userDetail && userDetail.token && (
          <div className="saveTobAndTabsHolder">
            <button className="saveTabHolder" onClick={backToCurrentTabSection}>
              <img
                src="images/popup/currentTabIcon.svg"
                alt="logo"
                className="saveTabImg"
              />{' '}
              Save Current Tab
            </button>
            <button className="tabsHolder" onClick={backToAllTabsSection}>
              <img src="images/popup/tabsIcon.svg" alt="logo" className="tabsImg" />{' '}
              Save All Tabs
            </button>
          </div>
        )}
        <div className="gptProfileContainer">
          {userDetail && userDetail.token && (
            <div className="gptProfileHolder">
              <span className="gptText">GPT</span>
              <label className="switch">
                <input
                  type="checkbox"
                  id="toggle-switch"
                  onChange={handleGptSwitch}
                  checked={isGptChecked}
                />
                <span className="slider"></span>
              </label>
            </div>
          )}
          <div
            className="profileIconHolder"
            onMouseEnter={handleShowProfileDropdown}
            onMouseLeave={handleHideProfileDropdown}
          >
            {!userDetail?.token && (
              <img
                src={
                  showProfileDropDown
                    ? 'images/popup/profileIconSelected.svg'
                    : 'images/popup/profileIcon.svg'
                }
                alt="profileLogo"
                className="profileIcon"
              />
            )}
            {userDetail && userDetail.token && userDetail.user.picture && (
              <img
                src={userDetail.user.picture}
                alt="profileLogo"
                className="profileImage"
              />
            )}
            {userDetail && userDetail.token && !userDetail.user.picture && (
              <div className="profileIdentity">
                {userDetail.user.name.slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </div>
      {showProfileDropDown && (
        <ProfileMenuDropDown
          onMouseEnter={handleShowProfileDropdown}
          onMouseLeave={handleHideProfileDropdown}
          setShowProfileDropDown={setShowProfileDropDown}
          setShowLoginModal={setShowLoginModal}
          userDetail={userDetail}
          allFolders={allFolders}
          allBookmarks={allBookmarks}
        />
      )}
      {showLoginModal && (
        <>
          <Backdrop />
          <LoginModal
            setShowLoginModal={setShowLoginModal}
            openVerifyAccount={openVerifyAccount}
          />
        </>
      )}
      {verifyAccount && (
        <>
          <Backdrop />
          <VerifyAccount closeVerifyAccount={closeVerifyAccount} />
        </>
      )}
    </>
  )
}
