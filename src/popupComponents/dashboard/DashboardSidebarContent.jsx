import React, { useEffect, useState } from 'react'
import '../dashboard/DashboardSection.css'
import {
  backToDashboardSectionArticles,
  backToDashboardSectionCollections,
  backToDashboardSectionFavorites,
  backToDashboardSectionHelpCenter,
  backToDashboardSectionImages,
  backToDashboardSectionLinks,
  backToDashboardSectionSettings,
  backToDashboardSectionVideos,
} from '../../utils/sectionManagement'

export default function DashboardSidebarContent({
  img,
  selectedImg,
  text,
  extra,
  dashboardSidebarContent,
}) {
  
  const handleSidebarContentClick = async (text) => {
    switch (text) {
      case 'Collections':
        backToDashboardSectionCollections()
        break

      case 'Favorites':
        backToDashboardSectionFavorites()
        break

      case 'Links':
        backToDashboardSectionLinks()
        break

      case 'Images':
        backToDashboardSectionImages()
        break

      case 'Videos':
        backToDashboardSectionVideos()
        break

      case 'Articles':
        backToDashboardSectionArticles()
        break

      case 'Settings':
        backToDashboardSectionSettings()
        break

      case 'Help Center':
        backToDashboardSectionHelpCenter()
        break

      default:
        break
    }
  }

  return (
    <div
      className={
        dashboardSidebarContent === text
          ? 'dashboardSidebarContentExtra'
          : 'dashboardSidebarContent'
      }
      style={
        extra
          ? {
              marginTop: '40px',
            }
          : {}
      }
      onClick={() => handleSidebarContentClick(text)}
    >
      <img
        src={dashboardSidebarContent === text ? selectedImg : img}
        alt={text}
        className={'dashboardSidebarIcon'}
      />
      {text}
    </div>
  )
}
