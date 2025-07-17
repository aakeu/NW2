import React, { useEffect, useRef, useState } from 'react'
import './MenuBar.css'
import { AppDispatch, RootState } from '../../state'
import { useDispatch, useSelector } from 'react-redux'
import MenuBarContent from './MenuBarContent'
import MenuOption from './MenuOption'
import { setActiveSection } from '../../state/slice/sectionSlice'
import { setFilteredMedia, setFilteredMediaTitle, setIsFilteredMedia } from '../../state/slice/reusableStatesSlice'
import OnboardingModal from '../onboarding/Onboarding'

const MenuBar: React.FC = () => {
  const [menuOption, setMenuOption] = useState(false)
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode)
  const { token } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch<AppDispatch>()
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const user = useSelector((state: RootState) => state.auth.user)
  const section = useSelector((state: RootState) => state.sections)
  const { isOnboardingHomeLogo, isOnboardingGPTLogo, 
    isOnboardingDashboardLogo, showOnboardingModal, chatModelDetail } = useSelector((state: RootState) => state.reusable)


  const handleShowMenuOption = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
    }
    setMenuOption(true)
  }
  const handleHideMenuOption = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setMenuOption(false)
    }, 200)
  }  

  const backToHome = async () => {
    await Promise.all([
      dispatch(setActiveSection("homeSection")),
      dispatch(setIsFilteredMedia(false)),
      dispatch(setFilteredMediaTitle(null)),
      dispatch(setFilteredMedia(null))
    ])
  }

  return (
    <div className={isDarkMode ? 'menuBarDark' : 'menuBar'}>
      {section.activeSection === "dashboardSection" ||
        section.activeSection === "dashboardCollectionSection" ||
        section.activeSection === "dashboardFavoritesSection" ||
        section.activeSection === "dashboardLinksSection" ||
        section.activeSection === "dashboardImagesSection" ||
        section.activeSection === "dashboardVideosSection" ||
        section.activeSection === "dashboardArticlesSection" ||
        section.activeSection === "dashboardMeetingsSection"
       ? (
        <div className={`menuBarContents`}>
          <div className='menuBarArrowBack' onClick={backToHome}>
            <img
              src="images/arrowBack.svg"
              alt="arrow back"
              className="arrowBackImg"
            />
          </div>
          <MenuBarContent
            style={{ marginTop: '20px' }}
            imageSrc={section.activeSection === "dashboardCollectionSection" ? 'images/collectionIconSelected.svg': 'images/collectionIcon.svg'}
            text="Collection"
            className={
              isDarkMode ? 'menuBarContentCollectionDark' : 'menuBarContentCollection'
            }
          />
          <MenuBarContent
            style={{ marginTop: '20px' }}
            imageSrc={section.activeSection === "dashboardFavoritesSection" ? 'images/favoriteIconSelected.svg' : 'images/favoriteIcon.svg'}
            text="Favorites"
            className={
              isDarkMode ? 'menuBarContentFavoriteDark' : 'menuBarContentFavorite'
            }
          />
          <MenuBarContent
            style={{ marginTop: '20px' }}
            imageSrc={section.activeSection === "dashboardLinksSection" ? 'images/linkSelected.svg' : 'images/link.svg'}
            text="Links"
            className={
              isDarkMode ? 'menuBarContentLinkDark' : 'menuBarContentLink'
            }
          />
          <MenuBarContent
            style={{ marginTop: '20px' }}
            imageSrc={section.activeSection === "dashboardImagesSection" ? 'images/imageIconSelected.svg' : "images/imageIcon.svg"}
            text="Images"
            className={
              isDarkMode ? 'menuBarContentImageDark' : 'menuBarContentImage'
            }
          />
          <MenuBarContent
            style={{ marginTop: '20px' }}
            imageSrc={section.activeSection === "dashboardVideosSection" ? 'images/videoIconSelected.svg' : "images/videoIcon.svg"}
            text="Videos"
            className={
              isDarkMode ? 'menuBarContentVideoDark' : 'menuBarContentVideo'
            }
          />
          <MenuBarContent
            style={{ marginTop: '20px' }}
            imageSrc={section.activeSection === "dashboardArticlesSection" ? 'images/articleIconSelected.svg': 'images/articelIcon.svg'}
            text="Articles"
            className={
              isDarkMode ? 'menuBarContentArticleDark' : 'menuBarContentArticle'
            }
          />
          <MenuBarContent
            style={{ marginTop: '20px' }}
            imageSrc={section.activeSection === "dashboardMeetingsSection" ? 'images/meetingSelected.svg': 'images/meeting.svg'}
            text="Meetings"
            className={
              isDarkMode ? 'menuBarContentSettingDark' : 'menuBarContentSetting'
            }
          />
          <MenuBarContent
            style={{ marginTop: '20px' }}
            imageSrc={'images/settins.svg'}
            text="Setting"
            className={
              isDarkMode ? 'menuBarContentSettingDark' : 'menuBarContentSetting'
            }
          />
          <img
            src={user && user.picture ? user.picture : 'images/pic.svg'}
            alt="Quick Search+"
            className="menuBarProfile"
            style={{ marginTop: '50px' }}
            onMouseEnter={handleShowMenuOption}
            onMouseLeave={handleHideMenuOption}
          />
        </div>
      ) : (
        <div className={`menuBarContents`}>
          <div className='quicksearchIconHolder'>
            <img
              src="images/quicksearchIcon.svg"
              alt="Quick Search+"
              className="quicksearchIcon"
            />
            {token && showOnboardingModal && isOnboardingHomeLogo && (
              <OnboardingModal 
                style={{ marginTop: "132px", marginLeft: "-70px" }} 
                tipPosition="topRight"
              />
            )}
          </div>
          <MenuBarContent
            style={section.activeSection === "homeSection" ? 
              { marginTop: '20px', color: "#019bdd" } : { marginTop: '20px' }}
            imageSrc={isDarkMode ? 'images/homeIcon2.svg' : 'images/homeIcon.svg'}
            text="Home"
            className={
              isDarkMode ? 'menuBarContentHomeDark' : 'menuBarContentHome'
            }
          />
          <div className='menuBarGPTLogoHolder'>
            <MenuBarContent
              style={section.activeSection === "chatSection" ? 
                { marginTop: '20px', color: "#019bdd" } : { marginTop: '20px' }}
              imageSrc={chatModelDetail.image}
              text="AI"
              className={
                isDarkMode ? 'menuBarContentChatDark' : 'menuBarContentChat'
              }
            />
            {token && showOnboardingModal && isOnboardingGPTLogo && (
              <OnboardingModal 
                style={{ marginTop: "136px", marginLeft: "-70px" }} 
                tipPosition="topRight"
              />
            )}
          </div>
          <MenuBarContent
            style={section.activeSection === "tabSection" ? 
              { marginTop: '20px', color: "#019bdd" } : { marginTop: '20px' }}
            imageSrc={isDarkMode ? section.activeSection === "tabSection" ? 'images/saveIconSelected.svg' 
              : "images/saveIcon2.svg" : section.activeSection === "tabSection" ? 'images/saveIconSelected.svg'
              : "images/saveIcon.svg"}
            text="Current Tab"
            className={
              isDarkMode ? 'menuBarContentSaveIconDark' : 'menuBarContentSaveIcon'
            }
          />
          <MenuBarContent
            style={section.activeSection === "allTabsSection" ? 
              { marginTop: '20px', color: "#019bdd" } : { marginTop: '20px' }}
            imageSrc={isDarkMode ? section.activeSection === "allTabsSection" ? 'images/saveAllIconSelected.svg' 
              : 'images/saveAllIcon2.svg' : section.activeSection === "allTabsSection" ? 'images/saveAllIconSelected.svg' 
              : 'images/saveAllIcon.svg'}
            text="Save All tabs"
            className={
              isDarkMode ? 'menuBarContentSaveAllDark' : 'menuBarContentSaveAll'
            }
          />
          <MenuBarContent
            style={section.activeSection === "translateSection" ? 
              { marginTop: '20px', color: "#019bdd" } : { marginTop: '20px' }}
            imageSrc={(isDarkMode &&  section.activeSection !== "translateSection")  ? 'images/translate-white.svg' : section.activeSection === "translateSection" ? 'images/translate-blue.svg' 
              : 'images/translate.svg'}
            text="Translate"
            className={
              isDarkMode ? 'menuBarContentSaveAllDark' : 'menuBarContentSaveAll'
            }
          />
          <MenuBarContent
            style={section.activeSection === "ocrSection" ? 
              { marginTop: '20px', color: "#019bdd" } : { marginTop: '20px' }}
            imageSrc={section.activeSection === "ocrSection" ? 'images/ocr-blue.svg' 
              : 'images/ocr.svg'} 
            text="OCR"
            className={
              isDarkMode ? 'menuBarContentSaveAllDark' : 'menuBarContentSaveAll'
            }
          />
          {!token && (
            <>
              <MenuBarContent
                style={{ marginTop: '2rem' }}
                imageSrc={
                  isDarkMode ? 'images/shareIcon2.svg' : 'images/shareIcon.svg'
                }
                text="Share"
                className={
                  isDarkMode ? 'menuBarContentShareDark' : 'menuBarContentShare'
                }
              />
              <MenuBarContent
                style={{ marginTop: '12px' }}
                imageSrc={
                  isDarkMode ? 'images/loginIcon2.svg' : 'images/loginIcon.svg'
                }
                text="Login"
                className={
                  isDarkMode ? 'menuBarContentLoginDark' : 'menuBarContentLogin'
                }
              />
            </>
          )}
          {token && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: "center",
                marginTop: '2rem',
                position: 'relative',
              }}
            >
              <div className=''>
                <MenuBarContent
                  style={{ marginTop: '-12px' }}
                  imageSrc={
                    isDarkMode ? 'images/dashboardIcon2.svg' : 'images/dashboardIcon.svg'
                  }
                  text="Dash"
                  className={
                    isDarkMode ? 'menuBarContentLoginDark' : 'menuBarContentLogin'
                  }
                />
                {token && showOnboardingModal && isOnboardingDashboardLogo && (
                  <OnboardingModal 
                    style={{ marginTop: "-109px", marginLeft: "-70px" }} 
                    tipPosition="bottomRight"
                  />
                )}
              </div>
              <img
                src={user && user.picture ? user.picture : 'images/pic.svg'}
                alt="Quick Search+"
                className="menuBarProfile"
                style={{ marginTop: '10px' }}
                onMouseEnter={handleShowMenuOption}
                onMouseLeave={handleHideMenuOption}
              />
            </div>
          )}
        </div>
      )}
      {token && menuOption && (
        <MenuOption
          onMouseEnter={handleShowMenuOption}
          onMouseLeave={handleHideMenuOption}
        />
      )}
    </div>
  )
}

export default MenuBar