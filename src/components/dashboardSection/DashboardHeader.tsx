import React, { useEffect, useRef, useState } from "react";
import '../dashboardSection/DashboardSection.css'
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../state";
import DashboardFilterModal from "./DashboardFilterModal";
import { setActiveCardList } from "../../state/slice/cardListSlice";
import { setActivationNeeded, setPaymentModalInfo, setShowFolderModal } from "../../state/slice/reusableStatesSlice";
import { fetchTracking } from "../../state/slice/trackingSlice";
import { debounce } from "../../utils/siderUtility/siderUtility";
import { useNotification } from "../notification/NotificationContext";

interface DashboardHeaderTitle {
    title: string
    onSearch?: (query: string) => void;
    onFilterChange?: (filter: string) => void;
}

const DashboardHeader: React.FC<DashboardHeaderTitle> = ({ title, onSearch, onFilterChange }) => {
    const [openFilterModal, setOpenFilterModal] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [activeFilter, setActiveFilter] = useState("Recent");
    const [notification, setNotification] = useState({ message: '', type: '' });
    const { createNotification } = useNotification();
    const { user } = useSelector((state: RootState) => state.auth)
    const { status } = useSelector((state: RootState) => state.status)
    const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode)
    const cardList = useSelector((state: RootState) => state.cardLIst)
    const folders = useSelector((state: RootState) => state.folders)
    const bookmarks = useSelector((state: RootState) => state.bookmarks)
    const section = useSelector((state: RootState) => state.sections)
    const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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

    const debouncedSearch = debounce((query: string) => {
        if (onSearch) {
          onSearch(query);
        }
      }, 300);

    const handleShowOpenFilterModal = () => {
        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
        setOpenFilterModal(true);
      };
    
      const handleHideOpenFilterModal = () => {
        hideTimeoutRef.current = setTimeout(
          () => setOpenFilterModal(false),
          200,
        );
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

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        debouncedSearch(query);
    };

    const handleFilterSelect = (filter: string) => {
        setActiveFilter(filter);
        if (onFilterChange) {
          onFilterChange(filter);
        }
    };

    return (
        <div className="dashboardHeaderSectionContainer">
             {status && status !== 'active' && (
                <span className="dashboardCollectionSectionInfo">
                    Please verify your email, check your registered email address 
                    and click on the link to get access to the full features...
                </span>
            )}
            <div className="dashboardHeaderSection">
                <div className="dashboardHeaderSectionLeft">
                    <span className={isDarkMode ? "dashboardHeaderSectionLeftTitleDark" 
                        : "dashboardHeaderSectionLeftTitle"}>{title}</span>
                    <div className={isDarkMode ? "dashboardHeaderSectionLeftSearchDark" 
                        : "dashboardHeaderSectionLeftSearch"}>
                        <div className="dashboardHeaderSectionLeftSearchHolder">
                            <div className="dashboardHeaderSectionLeftSearchImgHolder" style={{
                                marginTop: "20px"
                            }}>
                                <img 
                                    src="images/search.svg" 
                                    alt="search" 
                                    className="dashboardHeaderSectionLeftSearchImg" 
                                />
                            </div>
                            <input 
                                className={isDarkMode ? "dashboardHeaderSectionLeftSearchInputDark" 
                                    : "dashboardHeaderSectionLeftSearchInput" }
                                type="text" 
                                value={searchQuery}
                                onChange={handleSearchChange}
                                placeholder="Search by keyword" 
                                style={{
                                    marginTop: "20px",
                                }}
                            />
                        </div>
                        <img 
                            src="images/filter.svg" 
                            alt="filter" 
                            className="dashboardHeaderSectionLeftFilterImg" 
                            onMouseEnter={handleShowOpenFilterModal}
                            onMouseLeave={handleHideOpenFilterModal}
                        />
                        {openFilterModal && (
                            <DashboardFilterModal
                                onMouseEnter={handleShowOpenFilterModal}
                                onMouseLeave={handleHideOpenFilterModal}
                                onFilterSelect={handleFilterSelect}
                                activeFilter={activeFilter}
                            />
                        )}
                    </div>
                </div>
                <div className="dashboardHeaderSectionRight">
                    {section.activeSection === "dashboardCollectionSection" && (
                        <>
                            <span className={isDarkMode ? "dashboardHeaderSectionRightTitleDark" 
                                : "dashboardHeaderSectionRightTitle"}>New Folder</span>
                            <img 
                                src="images/add.svg" 
                                alt="filter" 
                                className="dashboardHeaderSectionRightAddImg" 
                                style={{
                                    width: "60px",
                                    height: "60px",
                                    marginTop: "-10px"
                                }}
                                onClick={handleShowFolderModal}
                            />
                        </>
                    )}
                    <img 
                        src={cardList.activeCardList === "isCard" ? 
                            "images/popup/cardIconSelected.svg" : "images/popup/cardIcon.svg"}
                        alt="card" 
                        className="dashboardHeaderSectionRightCardImg" 
                        onClick={() => dispatch(setActiveCardList('isCard'))}
                    />
                    <img 
                        src={cardList.activeCardList === "isList" ? 
                            "images/popup/listIconSelected.svg" : "images/popup/listIcon.svg"} 
                        alt="list" 
                        className="dashboardHeaderSectionRightListImg" 
                        onClick={() => dispatch(setActiveCardList('isList'))}
                    />
                </div>
            </div>
        </div>
    )
}

export default DashboardHeader