import React, { useState } from 'react'
import '../profile/ProfileSection.css'
import {
  accountUsage1,
  accountUsage2,
  profileFeaturesPart1,
  profileFeaturesPart2,
} from '../../utils/utility'
import ProfileSectionContent from './ProfileSectionContent'
import EditProfile from './EditProfile'
import Backdrop from '../backdrop/Backdrop'

export default function ProfileSection({ userDetail }) {
  const [editProfile, setEditProfile] = useState(false)

  const openEditProfile = () => {
    setEditProfile(true)
  }

  return (
    <>
      <div className="profileSectionContainer">
        <h2 className="profileSectionHeader">My Profile</h2>
        <div className="profileSectionDetail">
          {userDetail && userDetail.user.picture && (
            <img
              src={userDetail.user.picture}
              alt="profileUser"
              className="profileSectionDetailImg"
            />
          )}
          {userDetail && !userDetail.user.picture && (
            <img
              src="images/popup/profileUser.svg"
              alt="profileUser"
              className="profileSectionDetailImg"
            />
          )}
          <div className="profileSectionDetailInfo">
            <span className="profileSectionUserHeader">USERNAME</span>
            <div className="profileSectionUserHolder">
              {userDetail && (
                <h2 className="profileSectionUserName">
                  {userDetail.user.name}
                </h2>
              )}
              <div className="profileSectionStatus">
                <div className="profileSectionStatusState"></div>
                <span className="profileSectionStatusText">Free</span>
              </div>
            </div>
            <button className="profileSectionEditBtn" onClick={openEditProfile}>
              Edit Profile
            </button>
          </div>
        </div>
        <div className="profileSectionEmailHolder">
          <div className="profileSectionEmailIconHolder">
            <img
              src="images/popup/emailIcon.svg"
              alt="emailIcon"
              className="profileSectionEmailIcon"
            />
          </div>
          <div className="profileSectionEmailContents">
            <span className="profileSectionEmailText">Email</span>
            {userDetail && (
              <span className="profileSectionEmail">
                {userDetail.user.email}
              </span>
            )}
          </div>
        </div>
        <img
          src="images/popup/border.svg"
          alt="border"
          className="profileSectionBorderImg"
        />
        <div className="profileSectionFeaturesContainer">
          <h2 className="profileSectionFeaturesHeader">Features</h2>
          <div className="profileSectionFeaturesContents">
            <div className="profileSectionFeaturesContentsPart1">
              {userDetail &&
                userDetail.user.isSubscribed &&
                profileFeaturesPart1.map((feature, index) => (
                  <ProfileSectionContent
                    key={`${feature.text}-${index}`}
                    text={feature.text}
                    img={feature.img}
                    icon1={
                      feature.text === 'GPT' ||
                      feature.text === 'Google scholar'
                        ? 'images/popup/tick.svg'
                        : feature.icon1
                    }
                    icon2={
                      feature.text === 'Save 50+ links'
                        ? 'images/popup/tick.svg'
                        : feature.icon2
                    }
                    isIcon2={feature.text === 'Save 50+ links' ? true : false}
                  />
                ))}
              {userDetail &&
                !userDetail.user.isSubscribed &&
                profileFeaturesPart1.map((feature, index) => (
                  <ProfileSectionContent
                    key={`${feature.text}-${index}`}
                    text={feature.text}
                    img={feature.img}
                    icon1={feature.icon1}
                    icon2={feature.icon2}
                    isIcon2={feature.text === 'Save 50+ links' ? true : false}
                  />
                ))}
            </div>
            <div className="profileSectionFeaturesContentsPart2">
              {userDetail &&
                userDetail.user.isSubscribed &&
                profileFeaturesPart2.map((feature, index) => (
                  <ProfileSectionContent
                    key={`${feature.text}-${index}`}
                    text={feature.text}
                    img={feature.img}
                    icon1={
                      feature.text === 'Save GPT response' ||
                      feature.text === 'Image upload'
                        ? 'images/popup/tick.svg'
                        : feature.icon1
                    }
                    icon2={feature.icon2}
                    isIcon2={
                      feature.text === 'Save tabs' ||
                      feature.text === 'Bookmark'
                        ? true
                        : false
                    }
                  />
                ))}
              {userDetail &&
                !userDetail.user.isSubscribed &&
                profileFeaturesPart2.map((feature, index) => (
                  <ProfileSectionContent
                    key={`${feature.text}-${index}`}
                    text={feature.text}
                    img={feature.img}
                    icon1={feature.icon1}
                    icon2={feature.icon2}
                    isIcon2={
                      feature.text === 'Save tabs' ||
                      feature.text === 'Bookmark'
                        ? true
                        : false
                    }
                  />
                ))}
            </div>
          </div>
          <button className="profileSectionFeaturesUpgradeBtn">
            Upgrade to Pro
          </button>
          <div className="profileSectionFeaturesAccActivities">
            <h2 className="profileSectionFeaturesAccHeader">
              Account Activities
            </h2>
            <div className="profileSectionAccountSummary">
              <div className="profileSectionAccountSummaryHolder">
                {accountUsage1.map((data, index) => (
                  <div
                    className="profileSectionAccountSummaryDet"
                    key={`${data.name}-${index}`}
                  >
                    <span className="profileSectionAccText">{data.name}</span>
                    <progress
                      id="profileSectionAccProgress"
                      className="profileSectionAccProgress"
                      max="50"
                      value={data.value}
                    ></progress>
                    <span className="profileSectionAccValueText">
                      {data.value}/50
                    </span>
                  </div>
                ))}
              </div>
              <div className="profileSectionAccountSummaryHolder">
                {accountUsage2.map((data, index) => (
                  <div
                    className="profileSectionAccountSummaryDet"
                    key={`${data.name}-${index}`}
                  >
                    <span className="profileSectionAccText">{data.name}</span>
                    <progress
                      id="profileSectionAccProgress"
                      className="profileSectionAccProgress"
                      max="50"
                      value={data.value}
                    ></progress>
                    <span className="profileSectionAccValueText">
                      {data.value}/50
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {editProfile && (
        <>
          <Backdrop />
          <EditProfile
            setEditProfile={setEditProfile}
            userDetail={userDetail}
          />
        </>
      )}
    </>
  )
}
