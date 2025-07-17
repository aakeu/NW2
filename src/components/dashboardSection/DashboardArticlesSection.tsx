import React, { useState } from "react";
import '../dashboardSection/DashboardSection.css'
import { useSelector } from "react-redux";
import { RootState } from "../../state";
import DashboardHeader from "./DashboardHeader";
import DashboardImgVidArtSection from "./DahboardImgVidArtSection";
import DashboardFilteredMediaBreadcrumb from "./dashboardFilteredMediaBreadcrumb";
import DashboardFilteredMedia from "./DashboardFilteredMedia";

const DashboardArticlesSection: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("Recent");
    const { activeSection } = useSelector((state: RootState) => state.sections)
    const articles = useSelector((state: RootState) => state.articles)
    const cardList = useSelector((state: RootState) => state.cardLIst)
    const { isFilteredMedia, filteredMedia } = useSelector((state: RootState) => state.reusable)
    const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode)

    const handleSearch = (query: string) => {
        setSearchQuery(query.toLowerCase());
    };

    const handleFilterChange = (filter: string) => {
        setActiveFilter(filter);
    };

    const filteredArticles = Array.isArray(articles.articles)
        ? articles.articles.filter(
            (article) =>
            article.articleFolderName?.toLowerCase().includes(searchQuery)
        )
        : [];

    const allFilteredMedia = Array.isArray(filteredMedia)
        ? filteredMedia.filter((media) => media.name?.toLowerCase().includes(searchQuery))
        : []

    const sortedArticles = [...filteredArticles].sort((a, b) => {
        if (activeFilter === "Recent") {
            return Number(b.articleFolderName) - Number(a.articleFolderName);
        } else if (activeFilter === "Name" || activeFilter === "A-Z") {
            return (a.articleFolderName || "").localeCompare(b.articleFolderName || "");
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
        <div className="dashboardArticlesSection">
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
                    {cardList.activeCardList === "isCard" && !isFilteredMedia && (
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
                                                {activeSection === "dashboardArticlesSection" && (
                                                    <span className='dashboardCardFolderContentDetailsCount'>
                                                        23 items
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                </div>
                                {sortedArticles.length === 0 ? (
                                    <p className="dashboardCollectionSectionEmpty">
                                        No Article folder Found.
                                    </p>
                                ) : (
                                    sortedArticles.length > 0 &&
                                    sortedArticles.map((article) => (
                                            <DashboardImgVidArtSection 
                                                key={article?.id} 
                                                id={article?.id}
                                                title={article?.articleFolderName}
                                            />
                                    ))
                                )}
                            </div>
                        </>
                    )}
                    {cardList.activeCardList === "isList" && !isFilteredMedia && (
                        <>
                            <div className="dashboardCollectionSectionListContent">
                                <div className={isDarkMode ? "DashboardListFolderDark" 
                                    : "DashboardListFolder"}>
                                    <div className='DashboardListFolderContent'>
                                        <img src='images/popup/folder.svg' alt='folder' className='DashboardListFolderImg' />
                                        <div className='DashboardListFolderContentDetails'>
                                            <span className={isDarkMode ? 'DashboardListFolderContentDetailsTitleDark'
                                                : 'DashboardListFolderContentDetailsTitle'}>Default Uploads</span>
                                            {activeSection === "dashboardArticlesSection" && (
                                                <span className='DashboardListFolderContentDetailsCount'>
                                                    23 items
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {sortedArticles.length === 0 ? (
                                    <p className="dashboardCollectionSectionEmpty">
                                        No Article folder Found.
                                    </p>
                                ) : (
                                        sortedArticles.length > 0
                                        && sortedArticles.map((article) => (
                                        <DashboardImgVidArtSection 
                                            key={article?.id} 
                                            id={article?.id}
                                            title={article?.articleFolderName}
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

export default DashboardArticlesSection