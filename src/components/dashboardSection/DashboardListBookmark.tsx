import React, { useRef, useState } from 'react'
import '../dashboardSection/DashboardSection.css'
import { useSelector } from 'react-redux'
import { RootState } from '../../state'
import DashboardCardBookmarkDeleteModal from './DashboardCardBookmarkDeleteModal'
import { openLink } from '../reusables/Reusables'

interface DashboardListBookmarkProps {
    id: number
    title: string
    url: string
    source: string
    image: string
}

const DashboardListBookmark: React.FC<DashboardListBookmarkProps> = ({
    id, title, url, source, image
}) => {
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
        <div className={isDarkMode ? "dashboardListBookmarkDark" : "dashboardListBookmark"}>
            <div className='dashboardListBookmarkContentImgDetailsHolder'
                onClick={() => openLink(url, openInNewTab)}
            >
                <img src={image} alt={source} className='dashboardListBookmarkContentImg' />
                <span className='dashboardListBookmarkContentDetailsSource'>{source}</span>
                <div className='dashboardListBookmarkContentDetails'>
                    <span className={isDarkMode ? 'dashboardListBookmarkContentDetailsTitleDark'
                        : 'dashboardListBookmarkContentDetailsTitle'}>
                            {title.length > 22 ? title.slice(0, 22) + "..." : title}
                        </span>
                </div>
            </div>
            <div className='DashboardListBookmarkOptions'
                onMouseEnter={handleShowDeleteModal}
                onMouseLeave={handleHideDeleteModal}
            >
                <img src={isDarkMode ? 'images/ellipses.svg'
                    :'images/popup/ellipses.svg'} alt='ellipse' className='DashboardListBookmarkEllipses' />
            </div>
            {openBookmarkDeleteModal && (
                <DashboardCardBookmarkDeleteModal
                    onMouseEnter={handleShowDeleteModal}
                    onMouseLeave={handleHideDeleteModal}
                    id={id}
                    title={title}
                 />
            )}
        </div>
    )
}

export default DashboardListBookmark