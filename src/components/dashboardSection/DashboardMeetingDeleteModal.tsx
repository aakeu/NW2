import React from "react";
import '../dashboardSection/DashboardSection.css';
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../state";
import { setDeleteMeetingModal, setItemNameToDelete, setItemToDeleteId } from "../../state/slice/reusableStatesSlice";

interface DashboardRenameDeleteProps {
    onMouseEnter: () => void
    onMouseLeave: () => void
    data: {
        id: number;
        name: string;
    }
  }

const DashboardMeetingDeleteModal: React.FC<DashboardRenameDeleteProps> = ({ onMouseEnter, onMouseLeave, data }) => {
    const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode)
    const dispatch = useDispatch<AppDispatch>()
    return (
        <div className={isDarkMode ? "dashboardMeetingDeleteModalDark": "dashboardMeetingDeleteModal"}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <div className="dashboardMeetingDeleteModalContent">
                <div className="dashboardMeetingDeleteModalContentDelete"
                    onClick={() => {
                        dispatch(setDeleteMeetingModal(true))
                        dispatch(setItemToDeleteId(data.id))
                        dispatch(setItemNameToDelete(data.name))
                    }}
                >
                    <img src={isDarkMode ? "images/deleteWhite.svg" : 
                        "images/popup/deleteIcon.svg"} alt="delete" className="dashboardMeetingDeleteModalContentDeleteImg" />
                    <span className="dashboardMeetingDeleteModalContentDeleteTitle">Delete</span>
                </div>
            </div>
        </div>
    );
};

export default DashboardMeetingDeleteModal;
