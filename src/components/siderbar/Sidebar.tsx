import React, { useEffect, Suspense, lazy } from 'react'
import '../../sidebar/sidebar.css'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../state'
import { initializeSection, setActiveSection } from '../../state/slice/sectionSlice'
import { initializeAuth, loadAuthData } from '../../state/slice/authSlice'
import { scheduleTokenRefreshCronJob } from '../../state/slice/tokenRefreshCron'
import { initializeCardList } from '../../state/slice/cardListSlice'
import { initializeBookmarkParentName, initializeBookmarks, initializeChildBookmarks } from '../../state/slice/bookmarkSlice'
import { initializeChildFolders, initializeCollectionAncestorFolders, initializeFolders } from '../../state/slice/folderSlice'
import RenameFolder from '../createFolder/RenameFolder'
import DeleteModal from '../deleteModal/DeleteModal'
import { fetchAllFavorites, initializeFavorites } from '../../state/slice/favoriteSlice'
import EditProfile from '../profileSection/EditProfile'
import { fetchAllImages, initializeImages } from '../../state/slice/imageSlice'
import { fetchAllVideos, initializeVideos } from '../../state/slice/videoSlice'
import { fetchAllArticles, initializeArticles } from '../../state/slice/articleSlice'
import { initializeChatModelDetail, initializeFilteredMedia, initializeFilteredMediaTitle, initializeIsFilteredMedia } from '../../state/slice/reusableStatesSlice'
import SiderContainer from '../../sidebar/SiderContainer'
import MediaDeleteModal from '../deleteModal/MediaDeleteModal'
import OnboardingModal from '../onboarding/Onboarding'
import OnboardingVideo from '../onboarding/OnboardingVideo'
import VerifyAccountModal from '../loginModal/VerifyAccountModal'
import { fetchStatus } from '../../state/slice/statusSlice'
import DeleteMeetingModal from '../deleteModal/DeleteMeetingModal'
import MeetingDetailsModal from '../deleteModal/MeetingDetailsModal'

const WelcomeScreen = lazy(() => import('../welcome/WelcomeScreen'))
const HomeScreen = lazy(() => import('../home/HomeScreen'))
const TabSection = lazy(() => import('../tabSection/TabSection'))
const AllTabsSection = lazy(() => import('../allTabsSection/AllTabsSection'))
const ProfileSection = lazy(() => import('../profileSection/ProfileSection'))
const ChatSection = lazy(() => import('../chatSection/ChatSection'))
const DashboardSection = lazy(() => import('../dashboardSection/DashboardSection'))
const OCRSection = lazy(() => import('../ocrSection/OCRSection'))
const TranslateSection = lazy(() => import('../translateSection/TranslateSection'))
const Backdrop = lazy(() => import('../backdrop/Backdrop'))
const PaymentModal = lazy(() => import('../paymentModal/PaymentModal'))
const CreateFolder = lazy(() => import('../createFolder/CreateFolder'))
const LoginModal = lazy(() => import('../loginModal/LoginModal'))

const Sidebar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const activeSection = useSelector(
    (state: RootState) => state.sections.activeSection,
  )

  const { activationNeeded, showFolderModal, showRenameFolderModal, showEditProfileModal,
    showDeleteModal, showDeleteMeetingModal, showMediaDeleteModal, showOnboardingModal, isOnboardingVideo,
    showVerifyAccountModal, showMeetingDetailsModal
   } = useSelector(
    (state: RootState) => state.reusable,
  )
  const loginType = useSelector(
    (state: RootState) => state.loginType.activeLoginType,
  )
  const { user, token } = useSelector((state: RootState) => state.auth)
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode)

  useEffect(()=>{
    chrome.runtime.connect({ name: 'sidepanel' });
  },[])


  useEffect(() => {
    const refreshTokenCronJob = async () => {
      const authData = await loadAuthData();
      if (authData.token) {
        scheduleTokenRefreshCronJob(dispatch);
      }
    };
    refreshTokenCronJob();
  }, [dispatch]);

  useEffect(() => {
    const initializeBaseData = async () => {
      await Promise.all([
        dispatch(initializeAuth()),
        dispatch(initializeSection()),
        dispatch(initializeCardList()),
        dispatch(initializeBookmarks()),
        dispatch(initializeImages()),
        dispatch(initializeFavorites()),
        dispatch(initializeVideos()),
        dispatch(initializeArticles()),
        dispatch(initializeBookmarkParentName()),
        dispatch(initializeChildBookmarks()),
        dispatch(initializeFolders()),
        dispatch(initializeChildFolders()),
        dispatch(initializeCollectionAncestorFolders()),
        dispatch(initializeFilteredMedia()),
        dispatch(initializeIsFilteredMedia()),
        dispatch(initializeFilteredMediaTitle()),
        dispatch(initializeChatModelDetail())
      ]);
    };
  
    const initializeMediaData = async () => {
      await Promise.all([
        dispatch(fetchAllFavorites()),
        dispatch(initializeFavorites()),
        dispatch(fetchAllImages()),
        dispatch(initializeImages()),
        dispatch(fetchAllVideos()),
        dispatch(initializeVideos()),
        dispatch(fetchAllArticles()),
        dispatch(initializeArticles())
      ]);
    };
  
    const initializeData = async () => {
      await initializeBaseData();
      if (token) {
        await initializeMediaData();
      }
    };
  
    initializeData();
  }, [dispatch]);
  

  useEffect(() => {
    const handleDefaultDashSection = () => {
      if (activeSection === "dashboardSection") {
        if (
          ![
            "dashboardCollectionSection",
            "dashboardFavoritesSection",
            "dashboardLinksSection",
            "dashboardImagesSection",
            "dashboardVideosSection",
            "dashboardArticlesSection",
            "dashboardMeetingsSection"
          ].includes(activeSection)
        ) {
          dispatch(setActiveSection("dashboardCollectionSection"));
        }
      }
    };
    handleDefaultDashSection();
  }, [activeSection, dispatch]);

  const renderSection = () => {
    switch (activeSection) {
      case 'homeSection':
        return <HomeScreen />
      case 'tabSection':
        return <TabSection />
      case 'allTabsSection':
        return <AllTabsSection />
      case 'profileSection':
        return <ProfileSection />
      case 'chatSection':
        return <ChatSection />
      case 'dashboardCollectionSection':
        return <DashboardSection />
      case 'dashboardFavoritesSection':
        return <DashboardSection />
      case 'dashboardLinksSection':
        return <DashboardSection />
      case 'dashboardImagesSection':
        return <DashboardSection />
      case 'dashboardVideosSection':
        return <DashboardSection />
      case 'dashboardArticlesSection':
        return <DashboardSection />
      case 'dashboardMeetingsSection':
        return <DashboardSection />
      case 'welcomeSection':
        return <WelcomeScreen />
      case 'translateSection':
        return <TranslateSection />
      case 'ocrSection':
        return <OCRSection />
      default:
        return <WelcomeScreen />
    }
  }

  return (
    <div className="sidebar">
      <SiderContainer>
        <Suspense 
          // fallback={
          //   <div 
          //     className={`sidebar-loading ${isDarkMode ? 'dark' : 'light'}`}
          //   >
          //   </div>
          // }
        >
          {renderSection()}
        </Suspense>
      </SiderContainer>
      {(loginType === 'signInModal' || loginType === 'signUpModal') && (
          <Backdrop>
            <LoginModal />
          </Backdrop>
      )}
      {activationNeeded && (
          <Backdrop>
            <PaymentModal />
          </Backdrop>
      )}
      {showFolderModal && (
          <Backdrop>
            <CreateFolder />
          </Backdrop>
      )}
      {showRenameFolderModal && (
          <Backdrop>
            <RenameFolder />
          </Backdrop>
      )}
      {showDeleteModal && (
          <Backdrop>
            <DeleteModal />
          </Backdrop>
      )}
      {showDeleteMeetingModal && (
          <Backdrop>
            <DeleteMeetingModal />
          </Backdrop>
      )}
      {showMediaDeleteModal && (
          <Backdrop>
            <MediaDeleteModal />
          </Backdrop>
      )}
      {showEditProfileModal && (
          <Backdrop>
            <EditProfile user={user} token={token}/>
          </Backdrop>
      )}
      {token && isOnboardingVideo && (
        <Backdrop>
          <OnboardingVideo />
        </Backdrop>
      )}
      {showVerifyAccountModal && (
        <Backdrop>
          <VerifyAccountModal />
        </Backdrop>
      )}
      {showMeetingDetailsModal && (
        <Backdrop>
          <MeetingDetailsModal />
        </Backdrop>
      )}
    </div>
  )
}

export default Sidebar