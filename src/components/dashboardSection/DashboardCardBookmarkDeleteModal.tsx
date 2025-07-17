import React from "react";
import "../dashboardSection/DashboardSection.css";
import { AppDispatch, RootState } from "../../state";
import { useDispatch, useSelector } from "react-redux";
import { setDeleteModal, setIsBookmark, setIsDeleteFromFavorite, setItemNameToDelete, setItemToDeleteId } from "../../state/slice/reusableStatesSlice";

interface DashboardCardBookmarkDeleteProps {
    onMouseEnter: () => void
    onMouseLeave: () => void
    id: number
    title: string
}

const DashboardCardBookmarkDeleteModal: React.FC<DashboardCardBookmarkDeleteProps> 
  = ({onMouseEnter, onMouseLeave, id, title}) => {
    const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode)
    const section = useSelector((state: RootState) => state.sections.activeSection)
    const dispatch = useDispatch<AppDispatch>()

  return (
    <div className={isDarkMode ? "dashboardCardBookmarkDeleteModalDark" : "dashboardCardBookmarkDeleteModal"}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
    >
      <div className="dashboardCardBookmarkDeleteModalContent">
        {section === "dashboardFavoritesSection" && (
            <div className="dashboardCardBookmarkDeleteModalContentDelete"
                onClick={() => {
                  dispatch(setDeleteModal(true))
                  dispatch(setItemToDeleteId(id))
                  dispatch(setItemNameToDelete(title))
                  dispatch(setIsBookmark(true))
                  dispatch(setIsDeleteFromFavorite(true))
                }}
              >
              <img src={isDarkMode ? "images/favorite-selected-cancel.svg" : 
                  "images/favorite-cancel.svg"} alt="delete" 
                  className="dashboardCardBookmarkDeleteModalContentDeleteImg" />
              <span className="dashboardCardBookmarkDeleteModalContentDeleteTitle">Remove from favorites</span>
          </div>
        )}
        <div className="dashboardCardBookmarkDeleteModalContentDelete"
              onClick={() => {
                dispatch(setDeleteModal(true))
                dispatch(setItemToDeleteId(id))
                dispatch(setItemNameToDelete(title))
                dispatch(setIsBookmark(true))
              }}
            >
            <img src={isDarkMode ? "images/deleteWhite.svg" : 
                "images/popup/deleteIcon.svg"} alt="delete" 
                className="dashboardCardBookmarkDeleteModalContentDeleteImg" />
            <span className="dashboardCardBookmarkDeleteModalContentDeleteTitle">Delete</span>
        </div>
      </div>
    </div>
  );
}

export default DashboardCardBookmarkDeleteModal;