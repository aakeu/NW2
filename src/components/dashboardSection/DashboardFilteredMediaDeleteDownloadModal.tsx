import React, { useEffect, useState } from "react";
import '../dashboardSection/DashboardSection.css'
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../state";
import { setFilteredMediaId, setItemNameToDelete, setShowMediaDeleteModal } from "../../state/slice/reusableStatesSlice";
import { useNotification } from "../notification/NotificationContext";

interface MediaDeleteDownloadProps {
    onMouseEnter: () => void
    onMouseLeave: () => void
    id: number | null
    name: string
    url: string
}

const DashboardFilteredMediaDeleteDownloadModal: 
    React.FC<MediaDeleteDownloadProps> = ({ onMouseEnter, onMouseLeave, id, name, url }) => {
    const [notification, setNotification] = useState({ message: '', type: '' })
    const { createNotification } = useNotification()
    const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode)
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
        }
    }, [notification])

    const handleDownload = async (event: React.MouseEvent) => {
        event.preventDefault();
        try {
            const link = document.createElement("a");
            link.href = url;
            link.download = name || "media";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Download failed:", error);
            setNotification({
                message: "Failed to download media. Please try again.",
                type: 'error',
            });
        }
    };

    return (
        <div className={isDarkMode ? "dashboardCardBookmarkDeleteModalDark" : "dashboardCardBookmarkDeleteModal"}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}>
            <div className="dashboardCardBookmarkDeleteModalContent">
                <div className="dashboardCardBookmarkDeleteModalContentDelete"
                    onClick={handleDownload}
                    >
                    <img src={"images/download.svg"} alt="delete" 
                        className="dashboardCardBookmarkDeleteModalContentDeleteImg" />
                    <span className="dashboardCardBookmarkDeleteModalContentDeleteTitle">Download</span>
                </div>
                <div className="dashboardCardBookmarkDeleteModalContentDelete"
                    onClick={(event) => {
                        event.preventDefault()
                        dispatch(setShowMediaDeleteModal(true))
                        dispatch(setFilteredMediaId(id))
                        dispatch(setItemNameToDelete(name))
                    }}
                >
                <img src={isDarkMode ? "images/deleteWhite.svg" : 
                    "images/popup/deleteIcon.svg"} alt="delete" 
                    className="dashboardCardBookmarkDeleteModalContentDeleteImg" />
                <span className="dashboardCardBookmarkDeleteModalContentDeleteTitle">Delete</span>
            </div>
            </div>
        </div>
    )
}

export default DashboardFilteredMediaDeleteDownloadModal