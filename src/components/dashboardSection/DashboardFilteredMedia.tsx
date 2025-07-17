import React, { useRef, useState } from "react";
import '../dashboardSection/DashboardSection.css'
import { useSelector } from "react-redux";
import { RootState } from "../../state";
import { openLink } from "../reusables/Reusables";
import DashboardFilteredMediaDeleteDownloadModal from "./DashboardFilteredMediaDeleteDownloadModal";

interface FilteredMediaProps {
    data: {
        url: string,
        name: string
    }
}

const DashboardFilteredMedia: React.FC<FilteredMediaProps> = ({ data }) => {
    const [openFilteredMediaModal, setOpenFilteredMediaModal] = useState(false)
    const { activeSection } = useSelector((state: RootState) => state.sections)
    const cardList = useSelector((state: RootState) => state.cardLIst)
    const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode)
    const openInNewTab = useSelector(
        (state: RootState) => state.openInNewTab.openInNewTab,
    )
    const { filteredMedia,
         isFilteredMedia,
         filteredMediaTitle,
        filteredMediaId} = useSelector((state: RootState) => state.reusable)
    const hideFilteredMediaTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleShowFilteredMediaModal = () => {
        if (hideFilteredMediaTimeoutRef.current) clearTimeout(hideFilteredMediaTimeoutRef.current);
        setOpenFilteredMediaModal(true);
    };

    const handleHideFilteredMediaModal = () => {
        hideFilteredMediaTimeoutRef.current = setTimeout(
            () => setOpenFilteredMediaModal(false),
            200,
        );
    };

    const moderatedName = (text: string): string => {
        if (!text) return "";
    
        if (activeSection === "dashboardImagesSection" || activeSection === "dashboardArticlesSection") {
            const validExtensions = /\.(svg|png|jpeg|jpg|pdf)$/i;
            const match = text.match(validExtensions);
            if (!match) return text;
    
            const extension = match[0];
            const name = text.slice(0, -extension.length);
    
            if (name.length > 20) {
                return `${name.slice(0, 20)}...${extension}`;
            }
            return text;
        }
    
        return text;
    };

    return (
        <div className={cardList.activeCardList === "isCard" 
            ? 
                isDarkMode ? "dashboardCardBookmarkDark" : "dashboardCardBookmark"
            :   isDarkMode ? "dashboardListBookmarkDark" : "dashboardListBookmark"}
            >
                {cardList.activeCardList === "isCard" && (
                    <>
                        <div className="dashboardCardBookmarkImgHolder">
                            <img src={activeSection === "dashboardImagesSection" ? data.url
                                : activeSection === "dashboardArticlesSection" ? "images/articleIcon.svg"
                                : activeSection === "dashboardVideosSection" ? "images/videoIcon2.svg" 
                                : "images/media.svg"
                            } alt={data.name} className="dashboardCardBookmarkImg" 
                            onClick={() => openLink(data.url, openInNewTab)} />
                            <img src={isDarkMode ? 'images/ellipses.svg'
                                :'images/popup/ellipses.svg'} 
                                alt='ellipse' 
                                className='dashboardCardBookmarkEllipses' 
                                onMouseEnter={handleShowFilteredMediaModal}
                                onMouseLeave={handleHideFilteredMediaModal}
                            />
                            </div>
                            {openFilteredMediaModal && (
                                <DashboardFilteredMediaDeleteDownloadModal 
                                    onMouseEnter={handleShowFilteredMediaModal}
                                    onMouseLeave={handleHideFilteredMediaModal}
                                    id={filteredMediaId} 
                                    name={data.name}
                                    url={data.url}
                                />
                            )}
                        <div className={isDarkMode ? "dashboardCardBookmarkContentTitleDark" 
                            : "dashboardCardBookmarkContentTitle"}
                            onClick={() => openLink(data.url, openInNewTab)}
                        >{moderatedName(data.name)}</div>
                    </>
                )}
                {cardList.activeCardList === "isList" && (
                    <>
                        <div className='dashboardListBookmarkContentImgDetailsHolder'
                            onClick={() => openLink(data.url, openInNewTab)}
                        >
                            <img src={activeSection === "dashboardImagesSection" ? data.url
                                : activeSection === "dashboardArticlesSection" ? "images/articleIcon.svg"
                                : activeSection === "dashboardVideosSection" ? "images/videoIcon2.svg" 
                                : "images/media.svg"
                            } alt={data.name} className='dashboardListBookmarkContentImg' />
                            <div className='dashboardListBookmarkContentDetails'>
                                <span className={isDarkMode ? 'dashboardListBookmarkContentDetailsTitleDark'
                                    : 'dashboardListBookmarkContentDetailsTitle'}>
                                        {moderatedName(data.name)}
                                    </span>
                            </div>
                        </div>
                        {openFilteredMediaModal && (
                            <DashboardFilteredMediaDeleteDownloadModal 
                                onMouseEnter={handleShowFilteredMediaModal}
                                onMouseLeave={handleHideFilteredMediaModal}
                                id={filteredMediaId} 
                                name={data.name}
                                url={data.url}
                            />
                        )}
                        <div className='DashboardListBookmarkOptions'
                            onMouseEnter={handleShowFilteredMediaModal}
                            onMouseLeave={handleHideFilteredMediaModal}
                        >
                            <img src={isDarkMode ? 'images/ellipses.svg'
                                :'images/popup/ellipses.svg'} alt='ellipse' className='DashboardListBookmarkEllipses' />
                        </div>
                    </>
                )}
        </div>
    )
}

export default DashboardFilteredMedia