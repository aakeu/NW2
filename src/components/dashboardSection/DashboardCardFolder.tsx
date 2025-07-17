import React, { useMemo, useRef, useState } from 'react'
import '../dashboardSection/DashboardSection.css'
import { AppDispatch, RootState } from '../../state'
import { useDispatch, useSelector } from 'react-redux'
import DashboardRenameDeleteModal from './DashboardRenameDeleteModal'
import { ChildFolder, Folder } from '../../state/types/folder'
import { Bookmark } from '../../state/types/bookmark'
import { getChildBookmarks, getChildFolders, getParentFolders } from '../../utils/siderUtility/siderUtility'
import { setBookmarkParentName, setCollectionBookmarks } from '../../state/slice/bookmarkSlice'
import { setCollectionAncestorFolders, setCollectionFolders } from '../../state/slice/folderSlice'

interface DashboardCardFolderProps {
    data: ChildFolder
}

const DashboardCardFolder: React.FC<DashboardCardFolderProps> = ({ data }) => {
    const [openRenameDeleteModal, setOpenRenameDeleteModal] = useState(false)
    const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode)
    const bookmarks = useSelector((state: RootState) => state.bookmarks)
    const folders = useSelector((state: RootState) => state.folders)
    const hideRenameDeleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const dispatch = useDispatch<AppDispatch>()

    const handleShowRenameDeleteModal = () => {
        if (hideRenameDeleteTimeoutRef.current) clearTimeout(hideRenameDeleteTimeoutRef.current);
        setOpenRenameDeleteModal(true);
    };

    const handleHideRenameDeleteModal = () => {
        hideRenameDeleteTimeoutRef.current = setTimeout(
            () => setOpenRenameDeleteModal(false),
            200,
        );
    };

    const handleFolderClick = async (folderName: string, folders: Folder[], bookmarks: Bookmark[]) => {
        const ancestorFolders = await getParentFolders(folderName, folders)
        const childFolders = await getChildFolders(folderName, folders)
        const childBookmarks = await getChildBookmarks(folderName, bookmarks)

        dispatch(setBookmarkParentName(folderName))
        dispatch(setCollectionFolders(childFolders))
        dispatch(setCollectionAncestorFolders(ancestorFolders))
        dispatch(setCollectionBookmarks(childBookmarks))
    }

    const bookmarkCount = useMemo(() => {
        return Array.isArray(bookmarks.bookmarks)
            ? bookmarks.bookmarks.filter(
                  (bookmark) => bookmark.folderName === data?.name
              ).length
            : 0;
    }, [bookmarks.bookmarks, data?.name]);

    const folderCount = useMemo(() => {
        return Array.isArray(folders.folders)
            ? folders.folders.filter(
                  (folder) => folder.parentFolder === data?.name
              ).length
            : 0;
    }, [folders.folders, data?.name]);

    return (
        <div className={isDarkMode ? "dashboardCardFolderDark" : "dashboardCardFolder"}>
            <div className='dashboardCardFolderContent'>
                <div className='dashboardCardFolderContentDetails' 
                    onClick={() => handleFolderClick(data.name, folders.folders, bookmarks.bookmarks)}
                >
                    <img src='images/popup/folder.svg' alt='folder' className='dashboardCardFolderImg' />
                    <span className={isDarkMode ? 'dashboardCardFolderContentDetailsTitleDark'
                        : "dashboardCardFolderContentDetailsTitle"}>{data?.name}</span>
                    <span className='dashboardCardFolderContentDetailsCount'>
                        {`${folderCount} folders`}
                    </span>
                    <span className='dashboardCardFolderContentDetailsCount'>
                        {`${bookmarkCount} bookmarks`}
                    </span>
                </div>
            </div>
            <div className='dashboardCardFolderOptions'>
                <img src={isDarkMode ? 'images/ellipses.svg'
                    :'images/popup/ellipses.svg'} 
                    alt='ellipse' 
                    className='dashboardCardFolderEllipses' 
                    onMouseEnter={handleShowRenameDeleteModal}
                    onMouseLeave={handleHideRenameDeleteModal}
                />
                {openRenameDeleteModal && 
                    <DashboardRenameDeleteModal 
                        onMouseEnter={handleShowRenameDeleteModal}
                        onMouseLeave={handleHideRenameDeleteModal}
                        data={data}
                    />
                }
            </div>
        </div>
    )
}

export default DashboardCardFolder