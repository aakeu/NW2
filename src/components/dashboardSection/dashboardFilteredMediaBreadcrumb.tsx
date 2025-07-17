import React from "react";
import '../dashboardSection/DashboardSection.css'
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../state";
import { fetchAllImages, initializeImages } from "../../state/slice/imageSlice";
import { setFilteredMedia, setFilteredMediaTitle, setIsFilteredMedia } from "../../state/slice/reusableStatesSlice";
import { fetchAllVideos, initializeVideos } from "../../state/slice/videoSlice";
import { fetchAllArticles, initializeArticles } from "../../state/slice/articleSlice";


const DashboardFilteredMediaBreadcrumb: React.FC = () => {
    const { filteredMediaTitle } = useSelector((state: RootState) => state.reusable)
    const { activeSection } = useSelector((state: RootState) => state.sections)
    const dispatch = useDispatch<AppDispatch>()

    const handleFetchMedia = async () => {
        if (activeSection === "dashboardImagesSection") {
            await Promise.all([
                dispatch(fetchAllImages()),
                dispatch(initializeImages()),
                dispatch(setIsFilteredMedia(false)),
                dispatch(setFilteredMediaTitle(null)),
                dispatch(setFilteredMedia(null))
            ])
        } else if (activeSection === "dashboardVideosSection") {
            await Promise.all([
                dispatch(fetchAllVideos()),
                dispatch(initializeVideos()),
                dispatch(setIsFilteredMedia(false)),
                dispatch(setFilteredMediaTitle(null)),
                dispatch(setFilteredMedia(null))
            ])
        } else if (activeSection === "dashboardArticlesSection") {
            await Promise.all([
                dispatch(fetchAllArticles()),
                dispatch(initializeArticles()),
                dispatch(setIsFilteredMedia(false)),
                dispatch(setFilteredMediaTitle(null)),
                dispatch(setFilteredMedia(null))
            ])
        }
    }

    return (
    <nav className="dashboardBreadcrumb" aria-label="breadcrumb">
      <ol className="dashboardBreadcrumbList">
        {!filteredMediaTitle ? (
          <li className="dashboardBreadcrumbItem" 
            onClick={handleFetchMedia}
            >
            <img 
              src="images/home.svg" 
              alt="Home" 
              className="dashboardBreadHomeIcon" 
              aria-label="Home page"
            />
          </li>
        ) : (
            <>
              <li 
                className="dashboardBreadcrumbItem"
                onClick={handleFetchMedia}
              >
                <img 
                  src="images/home.svg" 
                  alt="Home" 
                  className="dashboardBreadHomeIcon" 
                  aria-label="Home page"
                />
              </li>
              <li 
                className="dashboardBreadcrumbItem"
              >
                <div className="dashboardBreadcrumbDetailHolder">
                  <img 
                    src="images/arrow_forward.svg" 
                    alt="" 
                    className="dashboardBreadHomeArrow" 
                    aria-hidden="true"
                  />
                  <span 
                    className="dashboardBreadcrumbText"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                        }
                      }}
                  >
                    {filteredMediaTitle}
                  </span>
                </div>
              </li>
            </>
            )
         }
      </ol>
    </nav>
    )
}

export default DashboardFilteredMediaBreadcrumb