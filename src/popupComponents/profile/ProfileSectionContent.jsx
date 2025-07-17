import React from 'react'
import '../profile/ProfileSection.css'

export default function ProfileSectionContent({
  img,
  text,
  icon1,
  icon2,
  isIcon2,
}) {
  return (
    <div className="profileSectionFeaturesContentDetail">
      <img
        src={img}
        alt="profile feature"
        className="profileSectionFeaturesContentDetailImg"
      />
      <span className="profileSectionFeaturesContentDetailText">{text}</span>
      <img
        src={icon1}
        alt="profile feature icon"
        className="profileSectionFeaturesContentDetailIcon"
      />
      {isIcon2 && (
        <img
          src={icon2}
          alt="profile feature icon"
          className="profileSectionFeaturesContentDetailIcon2"
        />
      )}
    </div>
  )
}
