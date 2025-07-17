import React, { useRef, useState } from "react";
import '../dashboardSection/DashboardSection.css'
import { useSelector } from "react-redux";
import { RootState } from "../../state";
import DashboardCardBookmarkDeleteModal from "./DashboardCardBookmarkDeleteModal";
import { openLink } from "../reusables/Reusables";

interface DashboardCardBookmarkProps {
    id: number
    title: string
    url: string
    source: string
    image: string
}

const DashboardCardBookmark: React.FC<DashboardCardBookmarkProps> = ({ id, title, url, source, image }) => {
    const [openBookmarkDeleteModal, setOpenBookmarkDeleteModal] = useState(false)
    const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode)
    const openInNewTab = useSelector(
        (state: RootState) => state.openInNewTab.openInNewTab,
    )
    const hideBookmarkDeleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleShowDeleteModal = () => {
        if (hideBookmarkDeleteTimeoutRef.current) clearTimeout(hideBookmarkDeleteTimeoutRef.current);
        setOpenBookmarkDeleteModal(true);
    };

    const handleHideDeleteModal = () => {
        hideBookmarkDeleteTimeoutRef.current = setTimeout(
            () => setOpenBookmarkDeleteModal(false),
            200,
        );
    };

    return (
        <div className={isDarkMode ? "dashboardCardBookmarkDark" : "dashboardCardBookmark"}>
            <div className="dashboardCardBookmarkImgHolder">
                <img src={image} alt={source} className="dashboardCardBookmarkImg" onClick={() => openLink(url, openInNewTab)} />
                <div className="dashboardCardBookmarkContentSource">{source}</div>
                <img src={isDarkMode ? 'images/ellipses.svg'
                    :'images/popup/ellipses.svg'} 
                    alt='ellipse' 
                    className='dashboardCardBookmarkEllipses' 
                    onMouseEnter={handleShowDeleteModal}
                    onMouseLeave={handleHideDeleteModal}
                />
            </div>
            <div className={isDarkMode ? "dashboardCardBookmarkContentTitleDark" 
                : "dashboardCardBookmarkContentTitle"}
                onClick={() => openLink(url, openInNewTab)}
            >{title.length > 22 ? title.slice(0, 22) + "..." : title}</div>

            {openBookmarkDeleteModal && 
                <DashboardCardBookmarkDeleteModal 
                    onMouseEnter={handleShowDeleteModal}
                    onMouseLeave={handleHideDeleteModal}
                    id={id}
                    title={title}
                />
            }
        </div>
    )
}

export default DashboardCardBookmark