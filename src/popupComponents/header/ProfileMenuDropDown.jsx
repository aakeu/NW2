import React, { useEffect } from 'react'
import { log_out } from '../../api/default'
import { useAuth } from '../../utils/AuthContext'
import {
  backToDashboardSection,
  backToProfileSection,
} from '../../utils/sectionManagement'
import { handleFolderClick } from '../../utils/dashboardUtility'

export default function ProfileMenuDropDown({
  onMouseEnter,
  onMouseLeave,
  setShowProfileDropDown,
  setShowLoginModal,
  userDetail,
  allFolders,
  allBookmarks,
}) {
  const { logout } = useAuth()
  const openLoginModal = () => {
    setShowLoginModal(true)
    setShowProfileDropDown(false)
  }

  const handleSignOut = async () => {
    await log_out()
    await logout()
    setShowLoginModal(false)
  }

  return (
    <div
      className="profileDropdownContainer"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="profileDropdownContentHolder">
        {userDetail && userDetail.token && (
          <>
            <div className="profileHolder" onClick={backToProfileSection}>
              <img
                src="images/popup/profileLogo.svg"
                alt="profile"
                className="profileLogo"
              />
              <span className="profileText">Profile</span>
            </div>
            <div
              className="dashboardHolder"
              onClick={() => {
                backToDashboardSection()
                handleFolderClick('/', allFolders, allBookmarks)
              }}
            >
              <img
                src="images/popup/dashboardIcon.svg"
                alt="dashboard"
                className="dashboardLogo"
              />
              <span className="dashboardText">Dashboard</span>
            </div>
            <div className="signoutHolder" onClick={handleSignOut}>
              <img
                src="images/popup/logoutIcon.svg"
                alt="sign out"
                className="signoutLogo"
              />
              <span className="signoutText">Sign Out</span>
            </div>
          </>
        )}
        <div className="shareHolder">
          <img src="images/popup/share.svg" alt="share" className="shareLogo" />
          <span className="shareText">Share</span>
        </div>
        {!userDetail?.token && (
          <div className="loginHolder" onClick={openLoginModal}>
            <img src="images/popup/log-in.svg" alt="login" className="loginLogo" />
            <span className="loginText">Login</span>
          </div>
        )}
      </div>
    </div>
  )
}
