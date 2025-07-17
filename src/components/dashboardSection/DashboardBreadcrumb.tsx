import React from 'react';
import '../dashboardSection/DashboardSection.css';
import { Folder } from '../../state/types/folder';
import { Bookmark } from '../../state/types/bookmark';
import { getChildBookmarks, getChildFolders, getParentFolders } from '../../utils/siderUtility/siderUtility';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../state';
import { initializeBookmarkParentName, initializeBookmarks, initializeChildBookmarks, setBookmarkParentName, setCollectionBookmarks } from '../../state/slice/bookmarkSlice';
import { initializeChildFolders, initializeCollectionAncestorFolders, initializeFolders, setCollectionAncestorFolders, setCollectionFolders } from '../../state/slice/folderSlice';

interface DashboardBreadcrumbProps {
  data: string[];
}

export const DashboardBreadcrumb: React.FC<DashboardBreadcrumbProps> = ({ 
  data, 
}) => {
    const bookmarks = useSelector((state: RootState) => state.bookmarks)
    const folders = useSelector((state: RootState) => state.folders)
    const dispatch = useDispatch<AppDispatch>()

    const handleFolderClick = async (folderName: string, folders: Folder[], bookmarks: Bookmark[]) => {
        const ancestorFolders = await getParentFolders(folderName, folders)
        const childFolders = await getChildFolders(folderName, folders)
        const childBookmarks = await getChildBookmarks(folderName, bookmarks)

       await Promise.all([
          dispatch(setBookmarkParentName(folderName)),
          dispatch(setCollectionFolders(childFolders)),
          dispatch(setCollectionAncestorFolders(ancestorFolders)),
          dispatch(setCollectionBookmarks(childBookmarks)),
          dispatch(initializeBookmarks()),
          dispatch(initializeBookmarkParentName()),
          dispatch(initializeChildBookmarks()),
          dispatch(initializeFolders()),
          dispatch(initializeChildFolders()),
          dispatch(initializeCollectionAncestorFolders())
        ])

    }
  return (
    <nav className="dashboardBreadcrumb" aria-label="breadcrumb">
      <ol className="dashboardBreadcrumbList">
        {data.length === 0 ? (
          <li className="dashboardBreadcrumbItem" 
            onClick={() => handleFolderClick("/", folders.folders, bookmarks.bookmarks)}>
            <img 
              src="images/home.svg" 
              alt="Home" 
              className="dashboardBreadHomeIcon" 
              aria-label="Home page"
            />
          </li>
        ) : (
          data.map((item, index) => (
            item === '/' ? (
              <li 
                key={`breadcrumb-${index}`} 
                className="dashboardBreadcrumbItem"
                onClick={() => handleFolderClick("/", folders.folders, bookmarks.bookmarks)}
              >
                <img 
                  src="images/home.svg" 
                  alt="Home" 
                  className="dashboardBreadHomeIcon" 
                  aria-label="Home page"
                />
              </li>
            ) : (
              <li 
                key={`breadcrumb-${index}`} 
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
                    onClick={() => handleFolderClick(item, folders.folders, bookmarks.bookmarks)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                        }
                      }}
                  >
                    {item}
                  </span>
                </div>
              </li>
            )
          ))
        )}
      </ol>
    </nav>
  );
};

export default DashboardBreadcrumb;