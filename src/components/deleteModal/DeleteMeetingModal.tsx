import React, { useEffect, useState } from "react";
import '../deleteModal/DeleteModal.css';
import { AppDispatch, RootState } from "../../state";
import { useDispatch, useSelector } from "react-redux";
import { setDeleteMeetingModal } from "../../state/slice/reusableStatesSlice";
import { useNotification } from "../notification/NotificationContext";

const DeleteMeetingModal: React.FC = () => {
    const [notification, setNotification] = useState({ message: '', type: '' })
    const [deleting, setDeleting] = useState(false)
    const { createNotification } = useNotification()
    const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
    const { itemNameToDelete, itemToDeleteId} 
        = useSelector((state: RootState) => state.reusable)
    const dispatch = useDispatch<AppDispatch>()

    useEffect(() => {
        const showNotification = (message: string | null, type: string) => {
            createNotification({
            message: message || '',
            duration: 5000,
            background: type === 'success' ? 'green' : 'red',
            color: '#fff',
            })
        }
        if (notification.message) {
            showNotification(notification.message, notification.type)
            if (notification.type === 'success') {
                dispatch(setDeleteMeetingModal(false))
            }
        }
    }, [notification])

    const handleDelete = async () => {
         try {
            setDeleting(true)    
        
            setNotification({
                message: "Meeting deleted successfully",
                type: 'success',
            })
        } catch (err) {
            setNotification({
                message:
                err instanceof Error
                    ? err.message
                    : 'Failed to delete meeting. Please try again',
                type: 'error',
            })
        } finally {
            setDeleting(false)
        }
    }

    return (
        <div className={isDarkMode ? "deleteModalDark" : "deleteModal"}>
            <div className="deleteModalContent">
                <img
                    src="images/close.svg"
                    alt="close"
                    className="deleteModalClose"
                    onClick={() => {
                        dispatch(setDeleteMeetingModal(false))
                    }}
                />
                <h3
                    className={
                        isDarkMode ? 'deleteModalHeaderDark' : 'deleteModalHeader'
                    }
                >
                    Delete
                </h3>
                <span className="deleteModalContentInfo">
                    Are you sure you want to delete?
                </span>
                <span className={isDarkMode ? "deleteModalContentTextDark" : "deleteModalContentText"}>
                    {
                        itemNameToDelete && itemNameToDelete?.length > 60
                            ? itemNameToDelete?.slice(0, 60) + "..."
                            : itemNameToDelete
                    }
                </span>
                <div className="deleteModalContentButtons">
                    <button
                        className={isDarkMode ? "deleteModalDeleteButtonDark" : "deleteModalDeleteButton"}
                        onClick={handleDelete}
                    >
                        {deleting ? "Deleting..." : "Delete"}
                    </button>
                    <button
                        className={isDarkMode ? "deleteModalCancelButtonDark" : "deleteModalCancelButton"}
                        onClick={() => {
                            dispatch(setDeleteMeetingModal(false))
                        }}
                    >
                        Cancel
                    </button>
                </div>
                <div className="deleteModalWarning">
                    <img
                        src={isDarkMode ? "images/warningDark.svg" : "images/warning.svg"}
                        alt="warning"
                        className="deleteModalWarningIcon"
                    />
                    <span className={isDarkMode ? "deleteModalWarningTextDark" : "deleteModalWarningText"}>
                        This can’t be undone
                    </span>
                </div>
            </div>
        </div>
    );
}

export default DeleteMeetingModal;