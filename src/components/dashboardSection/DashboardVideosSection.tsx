import React, { useState } from "react";
import '../dashboardSection/DashboardSection.css'
import { useSelector } from "react-redux";
import { RootState } from "../../state";
import DashboardHeader from "./DashboardHeader";
import DashboardImgVidArtSection from "./DahboardImgVidArtSection";
import DashboardFilteredMediaBreadcrumb from "./dashboardFilteredMediaBreadcrumb";
import DashboardFilteredMedia from "./DashboardFilteredMedia";

const DashboardVideosSection: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("Recent");
    const { activeSection } = useSelector((state: RootState) => state.sections)
    const videos = useSelector((state: RootState) => state.videos)
    const cardList = useSelector((state: RootState) => state.cardLIst)
    const { isFilteredMedia, filteredMedia } = useSelector((state: RootState) => state.reusable)
    const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode)

    const handleSearch = (query: string) => {
        setSearchQuery(query.toLowerCase());
    };

    const handleFilterChange = (filter: string) => {
        setActiveFilter(filter);
    };

    const filteredVideos = Array.isArray(videos.videos)
        ? videos.videos.filter(
            (video) =>
            video.videoFolderName?.toLowerCase().includes(searchQuery)
        )
        : [];

    const allFilteredMedia = Array.isArray(filteredMedia)
        ? filteredMedia.filter((media) => media.name?.toLowerCase().includes(searchQuery))
        : []

    const sortedVideos = [...filteredVideos].sort((a, b) => {
        if (activeFilter === "Recent") {
            return Number(b.videoFolderName) - Number(a.videoFolderName);
        } else if (activeFilter === "Name" || activeFilter === "A-Z") {
            return (a.videoFolderName || "").localeCompare(b.videoFolderName || "");
        }
        return 0;
    });
    
    const sortedFilteredMedia = [...allFilteredMedia].sort((a, b) => {
        if (activeFilter === "Recent") {
            return Number(b.name) - Number(a.name);
        } else if (activeFilter === "Name" || activeFilter === "A-Z") {
            return (a.name || "").localeCompare(b.name || "");
        }
        return 0;
    });

    return (
        <div className="dashboardVideosSection">
            <DashboardHeader title={activeSection === "dashboardArticlesSection" ? "Articles" : 
                    activeSection === "dashboardFavoritesSection" ? "Favorites" :
                    activeSection === "dashboardLinksSection" ? "Links" :
                    activeSection === "dashboardImagesSection" ? "Images" :
                    activeSection === "dashboardVideosSection" ? "Videos"
                    : "Collection"
                } 
                onSearch={handleSearch}
                onFilterChange={handleFilterChange}
            />
            <DashboardFilteredMediaBreadcrumb />
            {isFilteredMedia ? (
                <>
                {sortedFilteredMedia.length === 0 ? (
                        <p className="dashboardCollectionSectionEmpty">
                            No Filtered media found
                        </p>
                    ) : (
                        <div className={cardList.activeCardList === "isCard" 
                            ? 
                                "dashboardCollectionSectionContent"
                            :   "dashboardCollectionSectionListContent"}
                            >
                                {sortedFilteredMedia.length > 0 
                                && sortedFilteredMedia.map((data, index) => (
                                    <DashboardFilteredMedia 
                                        key={`${data.url}-${index}`} 
                                        data={data}
                                    />
                                ))}
                        </div>
                    )}
                </>
            ) : (
                <>
                    {cardList.activeCardList === "isCard" && (
                        <>
                            <div className="dashboardCollectionSectionContent">
                                <div className={ isDarkMode ? "dashboardCardFolderDark" 
                                    : "dashboardCardFolder"}>
                                        <div className='dashboardCardFolderContent'>
                                            <div className='dashboardCardFolderContentDetails'>
                                                <img src='images/popup/folder.svg' alt='folder' className='dashboardCardFolderImg' />
                                                <span style={{
                                                    textAlign: "center"
                                                }} className={isDarkMode ? 'dashboardCardFolderContentDetailsTitleDark'
                                                    : "dashboardCardFolderContentDetailsTitle"}>Default Uploads</span>
                                                {activeSection === "dashboardVideosSection" && (
                                                    <span className='dashboardCardFolderContentDetailsCount'>
                                                        23 items
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                </div>
                                {sortedVideos.length === 0 ? (
                                    <p className="dashboardCollectionSectionEmpty">
                                        No Video folder Found.
                                    </p>
                                ) : (
                                    sortedVideos.length > 0 && (
                                        sortedVideos.map((video) => (
                                            <DashboardImgVidArtSection 
                                                key={video?.id} 
                                                id={video?.id}
                                                title={video?.videoFolderName}
                                            />
                                        ))
                                    )                          
                                )}
                            </div>
                        </>
                    )}

                    {cardList.activeCardList === "isList" && (
                        <>
                            <div className="dashboardCollectionSectionListContent">
                                <div className={isDarkMode ? "DashboardListFolderDark" 
                                    : "DashboardListFolder"}>
                                    <div className='DashboardListFolderContent'>
                                        <img src='images/popup/folder.svg' alt='folder' className='DashboardListFolderImg' />
                                        <div className='DashboardListFolderContentDetails'>
                                            <span className={isDarkMode ? 'DashboardListFolderContentDetailsTitleDark'
                                                : 'DashboardListFolderContentDetailsTitle'}>Default Uploads</span>
                                            {activeSection === "dashboardVideosSection" && (
                                                <span className='DashboardListFolderContentDetailsCount'>
                                                    23 items
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {sortedVideos.length === 0 ? (
                                    <p className="dashboardCollectionSectionEmpty">
                                        No Video folder Found.
                                    </p>
                                ) : (
                                    sortedVideos.length > 0 && (
                                        sortedVideos.map((video) => (
                                            <DashboardImgVidArtSection 
                                                key={video?.id} 
                                                id={video?.id}
                                                title={video?.videoFolderName}
                                            />
                                        ))
                                    )                          
                                )}
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    )
}

export default DashboardVideosSection