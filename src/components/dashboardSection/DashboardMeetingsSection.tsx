import React, { useState } from "react";
import '../dashboardSection/DashboardSection.css'
import { useSelector } from "react-redux";
import { RootState } from "../../state";
import DashboardHeader from "./DashboardHeader";
import DashboardSectionMeetingsCard from "./DashboardSectionMeetingsCard";
import DashboardSectionMeetingsList from "./DashboardSectionMeetingsList";

const DashboardMeetingsSection: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("Recent");
    const cardList = useSelector((state: RootState) => state.cardLIst)
    const { activeSection } = useSelector((state: RootState) => state.sections)
    const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode)

    const handleSearch = (query: string) => {
        setSearchQuery(query.toLowerCase());
    };

    const handleFilterChange = (filter: string) => {
        setActiveFilter(filter);
    };
    return (
        <div className="dashboardMeetingSection">
            <DashboardHeader title={activeSection === "dashboardArticlesSection" ? "Articles" : 
                    activeSection === "dashboardFavoritesSection" ? "Favorites" :
                    activeSection === "dashboardLinksSection" ? "Links" :
                    activeSection === "dashboardImagesSection" ? "Images" :
                    activeSection === "dashboardVideosSection" ? "Videos" :
                    activeSection === "dashboardMeetingsSection" ? "Meetings"
                    : "Collection"
                } 
                onSearch={handleSearch}
                onFilterChange={handleFilterChange}
            />
            {cardList.activeCardList === "isCard" &&  (
                <DashboardSectionMeetingsCard />
            )}
            {cardList.activeCardList === "isList" &&  (
                <DashboardSectionMeetingsList />
            )}
        </div>
    )
}

export default DashboardMeetingsSection;