import React from "react";
import "../dashboardSection/DashboardSection.css";
import { AppDispatch, RootState } from "../../state";
import { useDispatch, useSelector } from "react-redux";
import { setDeleteModal, setFolderIdToRenameOrDelete, setFolderNameToRenameOrDelete, setIsFolder, setItemNameToDelete, setItemToDeleteId, setShowRenameFolderModal } from "../../state/slice/reusableStatesSlice";
import { ChildFolder } from "../../state/types/folder";

interface DashboardRenameDeleteProps {
    onMouseEnter: () => void
    onMouseLeave: () => void
    data: ChildFolder
  }

const DashboardRenameDeleteModal: React.FC<DashboardRenameDeleteProps> = ({onMouseEnter, onMouseLeave, data}) => {
    const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode)
    const dispatch = useDispatch<AppDispatch>()
  return (
    <div className={isDarkMode ? "dashboardRenameDeleteModalDark": "dashboardRenameDeleteModal"}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
    >
      <div className="dashboardRenameDeleteModalContent">
        <div className="dashboardRenameDeleteModalContentRename"
          onClick={() => {
            dispatch(setShowRenameFolderModal(true))
            dispatch(setFolderIdToRenameOrDelete(data.id))
            dispatch(setFolderNameToRenameOrDelete(data.name))
          }}
        >
            <img src={isDarkMode ? "images/renameWhite.svg": 
                "images/popup/renameIcon.svg"} alt="rename" className="dashboardRenameDeleteModalContentRenameImg" />
            <span className="dashboardRenameDeleteModalContentRenameTitle">Rename</span>
        </div>
        <div className="dashboardRenameDeleteModalContentDelete"
          onClick={() => {
            dispatch(setDeleteModal(true))
            dispatch(setItemToDeleteId(data.id))
            dispatch(setItemNameToDelete(data.name))
            dispatch(setIsFolder(true))
          }}
        >
            <img src={isDarkMode ? "images/deleteWhite.svg" : 
                "images/popup/deleteIcon.svg"} alt="delete" className="dashboardRenameDeleteModalContentDeleteImg" />
            <span className="dashboardRenameDeleteModalContentDeleteTitle">Delete</span>
        </div>
      </div>
    </div>
  );
}

export default DashboardRenameDeleteModal;