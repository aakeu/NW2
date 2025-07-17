import React, { useState, useEffect } from "react";
import '../dashboardSection/DashboardSection.css'
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../state";
import DashboardHeader from "./DashboardHeader";
import DashboardCardFolder from "./DashboardCardFolder";
import DashboardCardBookmark from "./DashboardCardBookmark";
import DashboardListFolder from "./DashboardListFolder";
import DashboardListBookmark from "./DashboardListBookmark";
import DashboardBreadcrumb from "./DashboardBreadcrumb";
import { fetchStatus } from "../../state/slice/statusSlice";

const DashboardCollectionSection: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("Recent");
    const { activeSection } = useSelector((state: RootState) => state.sections)
    const cardList = useSelector((state: RootState) => state.cardLIst)
    const bookmarks = useSelector((state: RootState) => state.bookmarks)
    const folders = useSelector((state: RootState) => state.folders)
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        dispatch(fetchStatus())
    }, [dispatch])

    const handleSearch = (query: string) => {
        setSearchQuery(query.toLowerCase());
    };

    const handleFilterChange = (filter: string) => {
        setActiveFilter(filter);
    };

    const filteredFolders = Array.isArray(folders.collectionFolders)
        ? folders.collectionFolders.filter((folder) =>
            folder.name?.toLowerCase().includes(searchQuery)
        )
        : [];

    const filteredBookmarks = Array.isArray(bookmarks.collectionBookmarks)
        ? bookmarks.collectionBookmarks.filter(
            (bookmark) =>
            bookmark.title?.toLowerCase().includes(searchQuery) ||
            bookmark.url?.toLowerCase().includes(searchQuery) 
        )
        : [];
    
    const sortedFolders = [...filteredFolders].sort((a, b) => {
        if (activeFilter === "Recent") {
            return Number(b.name || 0) - Number(a.name || 0);
        } else if (activeFilter === "Name" || activeFilter === "A-Z") {
            return (a.name || "").localeCompare(b.name || "");
        }
        return 0;
    });

    const sortedBookmarks = [...filteredBookmarks].sort((a, b) => {
        if (activeFilter === "Recent") {
            return Number(b.date) - Number(a.date);
        } else if (activeFilter === "Name" || activeFilter === "A-Z") {
            return (a.title || "").localeCompare(b.title || "");
        }
        return 0;
    });

    return (
        <div className="dashboardCollectionSection">
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
            {Array.isArray(folders.collectionAncestorFolders) && 
                folders.collectionAncestorFolders.length > 0 && (
                    <DashboardBreadcrumb data={folders.collectionAncestorFolders} />
                )}
            {cardList.activeCardList === "isCard" && (
                <>
                        {sortedFolders.length === 0 && sortedBookmarks.length === 0 ? (
                            <p className="dashboardCollectionSectionEmpty">
                                No folders or bookmarks Found.
                            </p>
                        ) : (
                        <div className="dashboardCollectionSectionContent">
                                {sortedFolders.length > 0 &&
                                    sortedFolders.map((folder) => (
                                        <DashboardCardFolder key={folder.id} data={folder} 
                                    />
                                ))}
                                {sortedBookmarks.length > 0 &&
                                    [...sortedBookmarks]
                                    .sort((a, b) => Number(b.date) - Number(a.date))
                                    .map((bookmark) => (
                                        <DashboardCardBookmark
                                            key={bookmark?.id}
                                            id={bookmark?.id}
                                            title={bookmark?.title}
                                            url={bookmark?.url}
                                            image={bookmark?.imgUrl}
                                            source={bookmark?.source}
                                        />
                                ))}
                        </div>
                     )}
                </>
            )}
            {cardList.activeCardList === "isList" && (
                <div className="dashboardCollectionSectionListContent">
                    {sortedFolders.length === 0 && sortedBookmarks.length === 0 ? (
                        <p className="dashboardCollectionSectionEmpty">
                            No folders or bookmarks Found.
                        </p>
                    ) : (
                    <>
                        {sortedFolders.length > 0 &&
                            sortedFolders.map((folder) => (
                                <DashboardListFolder key={folder.id} data={folder} />
                            ))}
                        {sortedBookmarks.length > 0 &&
                            [...sortedBookmarks]
                                .sort((a, b) => Number(b.date) - Number(a.date))
                                .map((bookmark) => (
                                <DashboardListBookmark
                                    key={bookmark?.id}
                                    id={bookmark?.id}
                                    title={bookmark?.title}
                                    url={bookmark?.url}
                                    image={bookmark?.imgUrl}
                                    source={bookmark?.source}
                                />
                        ))}
                    </>
                    )}
                </div>
            )}
        </div>
    )
}

export default DashboardCollectionSection