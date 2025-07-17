import React from "react";
import '../dashboardSection/DashboardSection.css'
import { useSelector } from "react-redux";
import { RootState } from "../../state";
import DashboardCollectionSection from "./DashboardCollectionSection";
import DashboardFavoriteSection from "./DashboardFavoriteSection";
import DashboardLinksSection from "./DashboardLinksSection";
import DashboardImagesSection from "./DashboardImagesSection";
import DashboardVideosSection from "./DashboardVideosSection";
import DashboardArticlesSection from "./DashboardArticlesSection";
import DashboardMeetingsSection from "./DashboardMeetingsSection";

const DashboardSection: React.FC = () => {
    const section = useSelector((state: RootState) => state.sections)

    const renderSection = () => {
      switch (section.activeSection) {
        case 'dashboardCollectionSection':
          return <DashboardCollectionSection />
        case 'dashboardFavoritesSection':
          return <DashboardFavoriteSection />
        case 'dashboardLinksSection':
          return <DashboardLinksSection />
        case 'dashboardImagesSection':
          return <DashboardImagesSection />
        case 'dashboardVideosSection':
          return <DashboardVideosSection />
        case 'dashboardArticlesSection':
          return <DashboardArticlesSection />
        case 'dashboardMeetingsSection':
          return <DashboardMeetingsSection />
        default:
          return <DashboardCollectionSection />
      }
    }
    return (
      <div className="dashboardSection">
        {renderSection()}
      </div>
    )
}

export default DashboardSection