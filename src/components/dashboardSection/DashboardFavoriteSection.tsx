import React from "react";
import '../dashboardSection/DashboardSection.css'
import { useSelector } from "react-redux";
import { RootState } from "../../state";
import DashboardHeader from "./DashboardHeader";
import DashboardCardBookmark from "./DashboardCardBookmark";
import DashboardListBookmark from "./DashboardListBookmark";

const DashboardFavoriteSection: React.FC = () => {
    const { activeSection } = useSelector((state: RootState) => state.sections)
    const favorites = useSelector((state: RootState) => state.favorites)
    const cardList = useSelector((state: RootState) => state.cardLIst)
    return (
        <div className="dashboardFavoriteSection">
            <DashboardHeader title={activeSection === "dashboardArticlesSection" ? "Articles" : 
                activeSection === "dashboardFavoritesSection" ? "Favorites" :
                activeSection === "dashboardLinksSection" ? "Links" :
                activeSection === "dashboardImagesSection" ? "Images" :
                activeSection === "dashboardVideosSection" ? "Videos"
                : "Collection"
            } />
            {cardList.activeCardList === "isCard" && (
                <>
                    <div className="dashboardCollectionSectionContent">
                        {Array.isArray(favorites.favorites) && 
                            favorites.favorites.length > 0 &&
                            favorites.favorites.map((favorite) => (
                                    <DashboardCardBookmark 
                                        key={favorite?.id} 
                                        id={favorite?.id}
                                        title={favorite?.title}
                                        url={favorite?.url} 
                                        image={favorite?.imgUrl} 
                                        source={"F"} 
                                    />
                        ))}
                    </div>
                    {favorites.favorites.length === 0 && (
                        <div className="dashboardNoFavorite">No Favorites added</div>
                    )}
                </>
            )}
            {cardList.activeCardList === "isList" && (
                <>
                    <div className="dashboardCollectionSectionListContent">
                        {Array.isArray(favorites.favorites) && 
                            favorites.favorites.length > 0
                            && favorites.favorites.map((favorite) => (
                            <DashboardListBookmark 
                                key={favorite?.id} 
                                id={favorite?.id}
                                title={favorite?.title}
                                url={favorite?.url} 
                                image={favorite?.imgUrl} 
                                source={"F"} 
                            />
                        ))}
                    </div>
                    {favorites.favorites.length === 0 && (
                        <div className="dashboardNoFavorite">No Favorites added</div>
                    )}
                </>
            )}
        </div>
    )
}

export default DashboardFavoriteSection