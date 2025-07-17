import React from "react";
import '../dashboardSection/DashboardSection.css'
import { useSelector } from "react-redux";
import { RootState } from "../../state";

interface DashboardFilterProps {
    onMouseEnter: () => void
    onMouseLeave: () => void
    onFilterSelect: (filter: string) => void;
    activeFilter: string;
  }

const DashboardFilterModal: React.FC<DashboardFilterProps> = ({ 
    onMouseEnter, 
    onMouseLeave,
    onFilterSelect,
    activeFilter
}) => {
    const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode)

    const handleFilterClick = (filter: string) => {
        onFilterSelect(filter);
    };

    return (
        <div className={isDarkMode ? "dashboardFilterModalDark" : "dashboardFilterModal"}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <div className="dashboardFilterModalContent">
                <span  className={
                    isDarkMode
                    ? `dashboardFilterModalRecentDark ${
                        activeFilter === "Recent" ? "dashboardFilterModalActive" : ""
                        }`
                    : `dashboardFilterModalRecent ${
                        activeFilter === "Recent" ? "dashboardFilterModalActive" : ""
                        }`
                }
                    onClick={() => handleFilterClick("Recent")}
                >Recent</span>
                <span className={
                    isDarkMode
                    ? `dashboardFilterModalNameDark ${
                        activeFilter === "Name" ? "dashboardFilterModalActive" : ""
                        }`
                    : `dashboardFilterModalName ${
                        activeFilter === "Name" ? "dashboardFilterModalActive" : ""
                        }`
                }
                    onClick={() => handleFilterClick("Name")}
                >Name</span>
                <span className={
                    isDarkMode
                    ? `dashboardFilterModalAZDark ${
                        activeFilter === "A-Z" ? "dashboardFilterModalActive" : ""
                        }`
                    : `dashboardFilterModalAZ ${
                        activeFilter === "A-Z" ? "dashboardFilterModalActive" : ""
                        }`
                }
                    onClick={() => handleFilterClick("A-Z")}
                >A - Z</span>
            </div>
        </div>
    )
}

export default DashboardFilterModal