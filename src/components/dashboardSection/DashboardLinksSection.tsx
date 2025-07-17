import React, { useState } from "react";
import '../dashboardSection/DashboardSection.css'
import { useSelector } from "react-redux";
import { RootState } from "../../state";
import DashboardHeader from "./DashboardHeader";
import DashboardCardBookmark from "./DashboardCardBookmark";
import DashboardListBookmark from "./DashboardListBookmark";

const DashboardLinksSection: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("Recent");
    const { activeSection } = useSelector((state: RootState) => state.sections)
    const cardList = useSelector((state: RootState) => state.cardLIst)
    const bookmarks = useSelector((state: RootState) => state.bookmarks)
    const folders = useSelector((state: RootState) => state.folders)

    const handleSearch = (query: string) => {
        setSearchQuery(query.toLowerCase());
    };

    const handleFilterChange = (filter: string) => {
        setActiveFilter(filter);
    };
    
    const filteredBookmarks = Array.isArray(bookmarks.bookmarks)
        ? bookmarks.bookmarks.filter(
            (bookmark) =>
            bookmark.title?.toLowerCase().includes(searchQuery) ||
            bookmark.url?.toLowerCase().includes(searchQuery) 
        )
        : [];

    const sortedBookmarks = [...filteredBookmarks].sort((a, b) => {
        if (activeFilter === "Recent") {
            return Number(b.date) - Number(a.date);
        } else if (activeFilter === "Name" || activeFilter === "A-Z") {
            return (a.title || "").localeCompare(b.title || "");
        }
        return 0;
    });
    
    return (
        <div className="dashboardLinksSection">
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
            {cardList.activeCardList === "isCard" && (
                <>
                    {sortedBookmarks.length === 0 ? (
                        <p className="dashboardCollectionSectionEmpty">
                            No bookmarks Found.
                        </p>
                    ) : (
                        <div className="dashboardCollectionSectionContent">
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
                            {sortedBookmarks.length === 0 && (
                                <div style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    margin: "60px auto"
                                }}>No Links available</div>
                            )}
                        </div>
                    )}
                </>
            )}
            {cardList.activeCardList === "isList" && (
                <div className="dashboardCollectionSectionListContent">
                    {sortedBookmarks.length === 0 ? (
                        <p className="dashboardCollectionSectionEmpty">
                            No bookmarks match your search.
                        </p>
                    ) : (
                        <>
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
                            {sortedBookmarks.length=== 0 && (
                                <div style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    margin: "60px auto"
                                }}>No Links available</div>
                            )}
                        </>
                    )}

                </div>
            )}
        </div>
    )
}

export default DashboardLinksSection