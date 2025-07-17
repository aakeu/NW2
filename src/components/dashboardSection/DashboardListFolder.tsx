import React, { useMemo, useRef } from "react";
import '../dashboardSection/DashboardSection.css'
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../state";
import DashboardRenameDeleteModal from "./DashboardRenameDeleteModal";
import { ChildFolder, Folder } from "../../state/types/folder";
import { Bookmark } from "../../state/types/bookmark";
import { getChildBookmarks, getChildFolders, getParentFolders } from "../../utils/siderUtility/siderUtility";
import { setBookmarkParentName, setCollectionBookmarks } from "../../state/slice/bookmarkSlice";
import { setCollectionAncestorFolders, setCollectionFolders } from "../../state/slice/folderSlice";

interface DashboardListFolderProps {
    data: ChildFolder
}

const DashboardListFolder: React.FC<DashboardListFolderProps> = ({ data }) => {
    const [openListFolderOptions, setOpenListFolderOptions] = React.useState(false)
    const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode)
    const bookmarks = useSelector((state: RootState) => state.bookmarks)
    const folders = useSelector((state: RootState) => state.folders)
    const hideListFolderOptionsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const dispatch = useDispatch<AppDispatch>()

    const handleShowOpenListFolderModal = () => {
        if (hideListFolderOptionsTimeoutRef.current) clearTimeout(hideListFolderOptionsTimeoutRef.current);
        setOpenListFolderOptions(true);
      };
    
      const handleHideOpenListFolderModal = () => {
        hideListFolderOptionsTimeoutRef.current = setTimeout(
          () => setOpenListFolderOptions(false),
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
        <div className={isDarkMode ? "DashboardListFolderDark" : "DashboardListFolder"}>
            <div className='DashboardListFolderContent'
                onClick={() => handleFolderClick(data.name, folders.folders, bookmarks.bookmarks)}
            >
                <img src='images/popup/folder.svg' alt='folder' className='DashboardListFolderImg' />
                <div className='DashboardListFolderContentDetails'>
                    <span className={isDarkMode ? 'DashboardListFolderContentDetailsTitleDark'
                        : 'DashboardListFolderContentDetailsTitle'}>{data?.name}</span>
                    <span className='DashboardListFolderContentDetailsCount'>
                        {`${folderCount} folders`}
                    </span>
                    <span className='DashboardListFolderContentDetailsCount'>
                        {`${bookmarkCount} bookmarks`}
                    </span>
                </div>
            </div>
            <div className='DashboardListFolderOptions'
                onMouseEnter={handleShowOpenListFolderModal}
                onMouseLeave={handleHideOpenListFolderModal}
            >
                <img src={isDarkMode ? 'images/ellipses.svg'
                    :'images/popup/ellipses.svg'} alt='ellipse' className='DashboardListFolderEllipses' />
            </div>
            {openListFolderOptions && (
                <DashboardRenameDeleteModal
                    onMouseEnter={handleShowOpenListFolderModal}
                    onMouseLeave={handleHideOpenListFolderModal}
                    data={data}
                 />
            )}
        </div>
    )
}

export default DashboardListFolder