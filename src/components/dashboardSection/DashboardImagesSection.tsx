import React, { useState } from "react";
import '../dashboardSection/DashboardSection.css'
import { useSelector } from "react-redux";
import { RootState } from "../../state";
import DashboardHeader from "./DashboardHeader";
import DashboardImgVidArtSection from "./DahboardImgVidArtSection";
import DashboardFilteredMediaBreadcrumb from "./dashboardFilteredMediaBreadcrumb";
import DashboardFilteredMedia from "./DashboardFilteredMedia";

const DashboardImagesSection: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("Recent");
    const { activeSection } = useSelector((state: RootState) => state.sections)
    const images = useSelector((state: RootState) => state.images)
    const cardList = useSelector((state: RootState) => state.cardLIst)
    const { isFilteredMedia, filteredMedia } = useSelector((state: RootState) => state.reusable)
    const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode)

    const handleSearch = (query: string) => {
        setSearchQuery(query.toLowerCase());
    };

    const handleFilterChange = (filter: string) => {
        setActiveFilter(filter);
    };

    const filteredImages = Array.isArray(images.images)
        ? images.images.filter(
            (image) =>
            image.imageFolderName?.toLowerCase().includes(searchQuery)
        )
        : [];

    const allFilteredMedia = Array.isArray(filteredMedia)
        ? filteredMedia.filter((media) => media.name?.toLowerCase().includes(searchQuery))
        : []

    const sortedImages = [...filteredImages].sort((a, b) => {
        if (activeFilter === "Recent") {
            return Number(b.imageFolderName) - Number(a.imageFolderName);
        } else if (activeFilter === "Name" || activeFilter === "A-Z") {
            return (a.imageFolderName || "").localeCompare(b.imageFolderName || "");
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
        <div className="dashboardImagesSection">
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
            {isFilteredMedia  ? (
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
                    {cardList.activeCardList === "isCard" &&  (
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
                                                {activeSection === "dashboardImagesSection" && (
                                                    <span className='dashboardCardFolderContentDetailsCount'>
                                                        23 items
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                </div>
                                {sortedImages.length === 0 ? (
                                    <p className="dashboardCollectionSectionEmpty">
                                        No Image folder Found.
                                    </p>
                                ) : (
                                    sortedImages.length > 0 &&
                                    sortedImages.map((image) => (
                                        <DashboardImgVidArtSection 
                                            key={image?.id} 
                                            id={image?.id}
                                            title={image?.imageFolderName}
                                        />
                                    ))
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
                                            {activeSection === "dashboardImagesSection" && (
                                                <span className='DashboardListFolderContentDetailsCount'>
                                                    23 items
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {sortedImages.length === 0 ? (
                                    <p className="dashboardCollectionSectionEmpty">
                                        No Image folder Found.
                                    </p>
                                ) : ( 
                                    sortedImages.length > 0
                                    && sortedImages.map((image) => (
                                    <DashboardImgVidArtSection 
                                            key={image?.id} 
                                            id={image?.id}
                                            title={image?.imageFolderName}
                                        />
                                    ))
                                )}
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    )
}
export default DashboardImagesSection