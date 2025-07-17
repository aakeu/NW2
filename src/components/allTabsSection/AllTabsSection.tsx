import React, { useEffect, useState } from "react";
import '../allTabsSection/AllTabsSection.css';
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../state";
import { getChromeStorage, ImageWithFallback } from "../reusables/Reusables";
import ReusableFolderContents from "../reusableFolder/ReusableFolderContents";
import { fetchTracking } from "../../state/slice/trackingSlice";
import { setActivationNeeded, setPaymentModalInfo, setShowFolderModal } from "../../state/slice/reusableStatesSlice";
import { setActiveSection } from "../../state/slice/sectionSlice";
import { createBookmark, fetchAllBookmarks } from "../../state/slice/bookmarkSlice";
import { Bookmark } from "../../state/types/bookmark";
import { setChromeStorage } from "../../utils/siderUtility/siderUtility";
import { useNotification } from "../notification/NotificationContext";
import { setActiveLoginType } from "../../state/slice/loginModalSlice";
import { fetchAllImages } from "../../state/slice/imageSlice";
import { fetchAllVideos } from "../../state/slice/videoSlice";
import { fetchAllArticles } from "../../state/slice/articleSlice";
import { Spinner } from "../spinner/Spinner";

interface TabInfo {
  url: string;
  title: string;
  favicon: string;
  foundInStore: boolean;
}

const AllTabsSection: React.FC = () => {
  const [readyToSaveAllTabs, setReadyToSaveAllTabs] = useState(false);
  const [tabs, setTabs] = useState<TabInfo[]>([]);
  const [tabInfoToAdd, setTabInfoToAdd] = useState<TabInfo[]>([]);
  const [isChecked, setIsChecked] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [isCreatingBookmark, setIsCreatingBookmark] = useState(false);
  const { createNotification } = useNotification();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const { token, user } = useSelector((state: RootState) => state.auth);
  const { selectedFolder } = useSelector((state: RootState) => state.reusable);
  const dispatch = useDispatch<AppDispatch>();

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

  useEffect(() => {
    const initializeTabsToAdd = async () => {
      try {
        const storedTabsToAdd = await getChromeStorage("tabsToAdd");
        const allTabsToAdd: TabInfo[] = Array.isArray(storedTabsToAdd) ? storedTabsToAdd : [];
        setTabInfoToAdd(allTabsToAdd);
      } catch (error) {
        console.error("Error loading tabsToAdd:", error);
      }
    };
    initializeTabsToAdd();
  }, []);

  useEffect(() => {
    const fetchTabs = async () => {
      const bookmarksData = await dispatch(fetchAllBookmarks()).unwrap();
      chrome.runtime.sendMessage({ type: 'GET_TABS' }, (response) => {
        if (response?.tabs) {
          const updatedTabs = response.tabs.map((tab: TabInfo) => ({
            ...tab,
            foundInStore: bookmarksData.some((bookmark: Bookmark) => bookmark.url === tab.url)
          }));
          setTabs(updatedTabs);

          setTabInfoToAdd((prevTabInfoToAdd) => {
            const filteredTabsToAdd = prevTabInfoToAdd.filter((tabToAdd) =>
              updatedTabs.some((tab: TabInfo) => tab.url === tabToAdd.url)
            );
            setChromeStorage("tabsToAdd", filteredTabsToAdd);
            return filteredTabsToAdd;
          });
        }
      });
    };
    fetchTabs();

    const listener = async (message: any) => {
      if (message.type === 'TABS_UPDATE') {
        const allTabsToAdd: TabInfo[] = (await getChromeStorage("tabsToAdd")) as TabInfo[] || [];
        dispatch(fetchAllBookmarks()).unwrap().then(async (bookmarksData: Bookmark[]) => {
          const updatedTabs = message.tabs.map((tab: TabInfo) => ({
            ...tab,
            foundInStore: bookmarksData.some((bookmark: Bookmark) => bookmark.url === tab.url)
          }));
          
          const filteredTabsToAdd = allTabsToAdd.filter((tabToAdd) =>
            updatedTabs.some((tab: TabInfo) => tab.url === tabToAdd.url)
          );
          
          await setChromeStorage("tabsToAdd", filteredTabsToAdd);
          setTabInfoToAdd(filteredTabsToAdd);
          setTabs(updatedTabs);
        });
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, [dispatch]);

  const handleTabClick = async (tab: TabInfo) => {
    try {
      const storedTabs = await getChromeStorage("tabsToAdd");
      let allTabsToAdd: TabInfo[] = Array.isArray(storedTabs) ? storedTabs : storedTabs ? [storedTabs] : [];
  
      const foundIndex = allTabsToAdd.findIndex(
        (data: TabInfo) => data.url === tab.url && data.title === tab.title
      );
  
      if (foundIndex !== -1) {
        allTabsToAdd.splice(foundIndex, 1);
      } else {
        if (allTabsToAdd.length >= 20) {
          setNotification({
            message: "The maximum number of tabs to add at once is 20",
            type: "error",
          });
          setReadyToSaveAllTabs(allTabsToAdd.length > 0 ? true : false)
          return;
        }
  
        const tracking = await dispatch(fetchTracking()).unwrap();
        const bookmarkCount = tracking?.numberOfBookmarks ?? 0;
  
        if (bookmarkCount + allTabsToAdd.length + 1 > 30 && !user?.isSubscribed) {
          dispatch(setActivationNeeded(true));
          dispatch(
            setPaymentModalInfo(
              `Selecting more than ${allTabsToAdd.length} tabs would exceed the number of bookmarks for a free plan. Upgrade your plan to continue using this service!`
            )
          );
          setReadyToSaveAllTabs(allTabsToAdd.length > 0 ? true : false)
          return;
        }
  
        allTabsToAdd.push(tab);
      }
  
      await setChromeStorage("tabsToAdd", allTabsToAdd);
  
      setTabInfoToAdd([...allTabsToAdd]);
      setReadyToSaveAllTabs(allTabsToAdd.length > 0);
  
      // console.log({
      //   "tabs to add size": allTabsToAdd.length,
      // });
    } catch (error) {
      console.error("Error in handleTabClick:", error);
      setNotification({
        message: "Failed to update tabs. Please try again.",
        type: "error",
      });
    }
  };

  const handleSelectAllTabsToggle = async () => {
    try {
      const storedTabs = await getChromeStorage("tabsToAdd");
      let allTabsToAdd: TabInfo[] = Array.isArray(storedTabs) ? storedTabs : storedTabs ? [storedTabs] : [];
  
      const eligibleTabs = Array.isArray(tabs) ? tabs.filter((tab) => !tab.foundInStore) : [];
  
      const allSelected =
        eligibleTabs.length > 0 &&
        Array.isArray(tabInfoToAdd) &&
        eligibleTabs.every((tab) =>
          tabInfoToAdd.some((selected) => selected.url === tab.url && selected.title === tab.title)
        );
  
      if (allSelected) {
        allTabsToAdd = [];
        setIsChecked(false);
      } else {
        if (eligibleTabs.length > 20) {
          setNotification({
            message: "The maximum number of tabs to add at once is 20",
            type: "error",
          });
          setReadyToSaveAllTabs(allTabsToAdd.length > 0 ? true : false)
          return;
        }
  
        const tracking = await dispatch(fetchTracking()).unwrap();
        const bookmarkCount = tracking?.numberOfBookmarks ?? 0;
  
        if (bookmarkCount + eligibleTabs.length > 30 && !user?.isSubscribed) {
          dispatch(setActivationNeeded(true));
          dispatch(
            setPaymentModalInfo(
              `Selecting all tabs would exceed the number of bookmarks for a free plan
              as it remains ${30 - bookmarkCount} bookmarks for you to exceed it.
              Upgrade your plan to continue using this service!`
            )
          );
          setReadyToSaveAllTabs(allTabsToAdd.length > 0 ? true : false)
          return;
        }
  
        allTabsToAdd = [...eligibleTabs];
        setIsChecked(true);
      }

      await setChromeStorage("tabsToAdd", allTabsToAdd);
  
      setTabInfoToAdd([...allTabsToAdd]);
      setReadyToSaveAllTabs(allTabsToAdd.length > 0);
  
      // console.log({
      //   "tabs to add size": allTabsToAdd.length,
      // });
    } catch (error) {
      // console.error("Error in handleSelectAllTabsToggle:", error);
      setNotification({
        message: "Failed to update tabs. Please try again.",
        type: "error",
      });
    }
  };

  useEffect(() => {
    const updateAllTabsCheckbox = () => {
      if (tabs?.length && tabInfoToAdd?.length) {
        const notFoundInStorageTabs = tabs.filter((tab) => !tab.foundInStore).length;
        setIsChecked(notFoundInStorageTabs === tabInfoToAdd.length);
      } else {
        setIsChecked(false);
      }
    };
    updateAllTabsCheckbox();
  }, [tabs, tabInfoToAdd]);

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

  const handleSaveTabs = async () => {
    if (!token) {
      setNotification({ message: 'You must login to bookmark', type: 'warning' });
      dispatch(setActiveLoginType('signInModal'));
      return;
    }
  
    const tracking = await dispatch(fetchTracking()).unwrap();
    const bookmarkCount = tracking?.numberOfBookmarks ?? 0;
    if (bookmarkCount > 30 && !user?.isSubscribed) {
      dispatch(setActivationNeeded(true));
      dispatch(setPaymentModalInfo('You have exceeded the number of bookmarks for a free plan, upgrade your plan to continue using this service!'));
      return;
    }
  
    if (!tabInfoToAdd.length) {
      setNotification({ message: 'No tabs selected to save', type: 'warning' });
      return;
    }
  
    setIsCreatingBookmark(true);
    try {
      const data = tabInfoToAdd.map((tabInfo) => ({
        imgUrl: tabInfo.favicon,
        snippet: null,
        title: tabInfo.title || '',
        url: tabInfo.url || '',
        source: 'T',
        folderName: selectedFolder || '',
        description: null,
      }));
  
      await Promise.all(data.map((dt) => dispatch(createBookmark(dt)).unwrap()));
      
      const bookmarksData = await dispatch(fetchAllBookmarks()).unwrap();
      await Promise.all([
        dispatch(fetchAllImages()).unwrap(),
        dispatch(fetchAllVideos()).unwrap(),
        dispatch(fetchAllArticles()).unwrap(),
      ]);

      setTabs((prevTabs) =>
        prevTabs.map((tab) => ({
          ...tab,
          foundInStore: bookmarksData.some((bookmark: Bookmark) => bookmark.url === tab.url),
        }))
      );
      await setChromeStorage("tabsToAdd", []);
      setTabInfoToAdd([]);

      setNotification({
        message: data.length > 1 ? 'Bookmarks created successfully' : 'Bookmark created successfully',
        type: 'success',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create bookmark';
      setNotification({
        message: `${errorMessage}. Please try again`,
        type: 'error',
      });
    } finally {
      setIsCreatingBookmark(false);
    }
  };

  return (
    <div className="allTabsSection">
      <h2 className={isDarkMode ? "allTabsSectionHeaderDark" : "allTabsSectionHeader"}>
        Save All <span className="allTabsSectionHeaderSub">Tabs</span>
      </h2>
      <h3 className="allTabsSectionTotalCount">{tabs && tabs.length > 0 && `Found ${tabs.length} tabs`}</h3>
      <div className="allTabsContentsContainer">
        <div className="allTabsContentHeader">Tabs</div>
        <div className={isDarkMode ? "allTabsContentsHolderDark" : "allTabsContentsHolder"}>
          {Array.isArray(tabs) && tabs.length > 0 ? (
            tabs.map((data, index) => {
              const isSelected = tabInfoToAdd.some(
                (tab) => tab.url === data.url && tab.title === data.title
              );
              return (
                <div
                  key={`${data.url}-${index}`}
                  className={
                    isDarkMode
                      ? data.foundInStore
                        ? "allTabsContentsDetailDarkExtra"
                        : isSelected
                          ? "allTabsContentsDetailDarkSelected"
                          : "allTabsContentsDetailDark"
                      : data.foundInStore
                        ? "allTabsContentsDetailExtra"
                        : isSelected
                          ? "allTabsContentsDetailSelected"
                          : "allTabsContentsDetail"
                  }
                  onClick={() => !data.foundInStore && handleTabClick(data)}
                >
                  <ImageWithFallback
                    src={data.favicon}
                    alt="link favicon"
                    styleString="allTabsContentDetailImg"
                    fallbackSrc={data.favicon}
                    handleClick={() => {}}
                  />
                  {data.title.length > 40 ? data.title.slice(0, 40) + "..." : data.title}
                </div>
              );
            })
          ) : (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              No Tabs To Display
            </div>
          )}
        </div>
      </div>
      <div className="allTabsSelectAllTabs">
        <input
          type="checkbox"
          className="allTabsSelectAllCheckbox"
          checked={isChecked}
          onChange={handleSelectAllTabsToggle}
        />
        <span className="allTabsSelectAllText">
          {tabs && tabs.length > 0 && tabInfoToAdd.length > 0 && tabs.filter((tab) => !tab.foundInStore).length === tabInfoToAdd.length
            ? "All Tabs Selected"
            : tabInfoToAdd.length > 0
              ? `${tabInfoToAdd.length} tabs selected`
              : "Select All tabs"}
        </span>
      </div>
      <div className="allTabsCollectionHolder">
        <h3 className="allTabsCollectionHeader">Collection</h3>
        <div className="allTabsFolderContentsHolder">
          <ReusableFolderContents style={{ width: "150px" }} isMarginLeft={true} placedOnTop={true} />
          <img
            src="images/folderIcon.svg"
            alt="folder"
            className="allTabsFolderImg"
            onClick={handleShowFolderModal}
          />
        </div>
      </div>
      <div className="allTabsTabsBtnHolder">
        <div></div>
        <div className="allTabsBtnHolder">
          <button
            className={isDarkMode ? "allTabsCurrentTabBtnDark" : "allTabsCurrentTabBtn"}
            onClick={() => dispatch(setActiveSection('tabSection'))}
          >
            Save Current Tab
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
              disabled={!readyToSaveAllTabs}
              className={!readyToSaveAllTabs ? "allTabsSubmitBtnExtra" : "allTabsSubmitBtn"}
              onClick={handleSaveTabs}
            >
              Save Tabs
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllTabsSection;