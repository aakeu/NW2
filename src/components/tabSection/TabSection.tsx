import React, { useEffect, useState } from "react";
import '../tabSection/TabSection.css';
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../state";
import ReusableFolderContents from "../reusableFolder/ReusableFolderContents";
import { fetchTracking } from "../../state/slice/trackingSlice";
import { setActivationNeeded, setPaymentModalInfo, setShowFolderModal } from "../../state/slice/reusableStatesSlice";
import { useNotification } from "../notification/NotificationContext";
import { setActiveSection } from "../../state/slice/sectionSlice";
import { setActiveLoginType } from "../../state/slice/loginModalSlice";
import { createBookmark, fetchAllBookmarks } from "../../state/slice/bookmarkSlice";
import { fetchAllImages } from "../../state/slice/imageSlice";
import { fetchAllVideos } from "../../state/slice/videoSlice";
import { fetchAllArticles } from "../../state/slice/articleSlice";
import { Spinner } from "../spinner/Spinner";
import { Bookmark } from "../../state/types/bookmark";

interface TabInfo {
  url: string;
  title: string;
  favicon: string;
  foundInStore: boolean;
}

const TabSection: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<TabInfo | null>(null);
  const [description, setDescription] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [isCreatingBookmark, setIsCreatingBookmark] = useState(false);
  const { createNotification } = useNotification();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const { token, user } = useSelector((state: RootState) => state.auth);
  const { selectedFolder } = useSelector((state: RootState) => state.reusable);
  const dispatch = useDispatch<AppDispatch>();

  const handleDescription = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setDescription(event.target.value);
  };

  const fetchCurrentTab = async () => {
     const bookmarksData = await dispatch(fetchAllBookmarks()).unwrap();
    chrome.runtime.sendMessage({ type: 'GET_THE_CURRENT_TAB' }, (response) => {
      if (response?.tab) {
        const updatedTab = {
          ...response.tab,
          foundInStore: bookmarksData.some((bookmark: Bookmark) => bookmark.url === response.tab.url)
        };
        setCurrentTab(updatedTab);
      }
    });
  };

  useEffect(() => {
    fetchCurrentTab();

    const listener = (message: any) => {
      if (message.type === 'CURRENT_TAB_UPDATE') {
        dispatch(fetchAllBookmarks()).unwrap().then((bookmarksData: Bookmark[]) => {
          const updatedTab = {
            ...message.tab,
            foundInStore: bookmarksData.some((bookmark: Bookmark) => bookmark.url === message.tab.url)
          };
          setCurrentTab(updatedTab);
        });
      }
    };
    
    chrome.runtime.onMessage.addListener(listener);
    
    return () => {
      chrome.runtime.onMessage.removeListener(listener);
    };
  }, []);

  useEffect(() => {
    const showNotification = (message: string, type: string) => {
      createNotification({
        message,
        duration: 5000,
        background: type === 'success' ? 'green' : type === 'warning' ? '#17a2b8' : 'red',
        color: '#fff',
      });
    };
    if (notification.message) {
      showNotification(notification.message, notification.type);
    }
  }, [notification]);

  const handleSaveCurrentTab = async () => {
    if (!token) {
      setNotification({
        message: 'You must login to bookmark',
        type: 'warning',
      });
      dispatch(setActiveLoginType('signInModal'));
      return;
    }

    const tracking = await dispatch(fetchTracking()).unwrap();
    if (tracking.numberOfBookmarks > 30 && !user?.isSubscribed) {
      dispatch(setActivationNeeded(true));
      dispatch(
        setPaymentModalInfo(
          'You have exceeded the number of bookmarks for a free plan, upgrade your plan to continue using this service!',
        ),
      );
      return;
    }

    setIsCreatingBookmark(true);
    try {
      const bookmarksData = await dispatch(fetchAllBookmarks()).unwrap();
      const imgUrl = currentTab?.favicon || "images/tabScreenshot.svg"

      const data = {
        imgUrl,
        snippet: description || '',
        title: currentTab?.title || '',
        url: currentTab?.url || '',
        source: 'T',
        folderName: selectedFolder || '',
        description: description || '',
      };

      const bookmarkExists = bookmarksData.some(
        (bookmark) => bookmark.url === data.url,
      );
      if (bookmarkExists) {
        setNotification({
          message: `Bookmark with name "${data.title}" already exists`,
          type: 'error',
        });
        return;
      }

      await dispatch(createBookmark(data)).unwrap();
      setNotification({
        message: 'Bookmark created successfully',
        type: 'success',
      });
      await Promise.all([
        fetchCurrentTab(),
        dispatch(fetchAllImages()).unwrap(),
        dispatch(fetchAllVideos()).unwrap(),
        dispatch(fetchAllArticles()).unwrap(),
      ]);
    } catch (err) {
      console.error('Create bookmark error:', err);
      setNotification({
        message:
          err instanceof Error
            ? err.message
            : 'Failed to create bookmark. Please try again',
        type: 'error',
      });
    } finally {
      setIsCreatingBookmark(false);
    }
  };

  const handleShowFolderModal = async () => {
    try {
      const tracking = await dispatch(fetchTracking()).unwrap();
      const numberOfFolders = tracking?.numberOfFolders ?? 0;
  
      if (numberOfFolders >= 5 && !user?.isSubscribed) {
        dispatch(setActivationNeeded(true));
        dispatch(
          setPaymentModalInfo(
            "You have reached the 5-folder limit for a free plan. Upgrade your plan to create more folders!"
          )
        );
      } else {
        dispatch(setShowFolderModal(true));
      }
    } catch (error) {
      // console.error("Error in handleShowFolderModal:", error);
      setNotification({
        message: "Failed to check folder limit. Please try again.",
        type: "error",
      });
    }
  };

  return (
    <div className="tabSection">
      <div className="tabSectionContainer">
        <div className="tabSectionScreenshot">
          <div className={isDarkMode ? "tabSectionHeaderDark" : "tabSectionHeader"}>
            Save <span className="tabSectionHeaderTab">Tab</span>
          </div>
          {currentTab?.favicon ? (
            <img src={currentTab.favicon} alt="screenshot" className="tabSectionScreenshot" />
          ) : (
            <img src="images/tabScreenshot.svg" alt="screenshot" className="tabSectionScreenshot" />
          )}
        </div>
        <div className="tabSectionContents">
          <h4 className="tabSectionContentsHeader">{currentTab?.title || "Tab Name"}</h4>
          <p className={isDarkMode ? "tabSectionContentsDescDark" : "tabSectionContentsDesc"}>
            {!currentTab?.title && "There are no carriers or apps available..."}
          </p>
          <span className="tabSectionContentsDescHeader">Description</span>
          <textarea
            className={isDarkMode ? "tabSectionTextareaDark" : "tabSectionTextarea"}
            name="tabSectionTextarea"
            rows={5}
            placeholder="Input Note or Description ...."
            value={description}
            onChange={handleDescription}
          />
          <div className="tabSectionFolder">
            <div className="tabSectionFolderCollection">
              <div className="tabSectionFolderCollectionHeader">
                Collection
                <div className="tabSectionReusableHolder">
                  <ReusableFolderContents style={{ width: "150px" }} isMarginLeft={true} placedOnTop={false} />
                </div>
              </div>
            </div>
            <img
              onClick={handleShowFolderModal}
              src="images/folderIcon.svg"
              alt="folder icon"
              className="tabSectionFolderIcon"
            />
          </div>
          <span className="tabSectionTag">Tags</span>
          <input
            type="text"
            className={isDarkMode ? "tabSectionTagInputDark" : "tabSectionTagInput"}
            placeholder="Add tag..."
          />
          <span className="tabSectionUrl">URL</span>
          <input
            type="text"
            className={isDarkMode ? "tabSectionUrlInputDark" : "tabSectionUrlInput"}
            value={currentTab?.url || ''}
            readOnly
            placeholder="https://community.shopify.com/c/payments-shipping-and/quot-there-are-no-..."
          />
          <div className="tabSectionBtnHolder">
            <button
              onClick={() => dispatch(setActiveSection('allTabsSection'))}
              type="button"
              className={isDarkMode ? "tabSectionBtnSaveAllTabsDark" : "tabSectionBtnSaveAllTabs"}
            >
              <img src="images/saveAllTabs.svg" alt="all tab icon" className="tabSectionBtnImg" /> Save All Tab
            </button>
            {isCreatingBookmark ? (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Spinner />
              </div>
            ) : (
              <button
                disabled={!currentTab?.url || !currentTab?.title}
                onClick={handleSaveCurrentTab}
                type="button"
                className={`${!currentTab?.url || !currentTab?.title || currentTab.foundInStore ? 'tabSectionBtnSaveTabExtra' : 'tabSectionBtnSaveTab'}`}
              >
                Save Tab
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabSection;