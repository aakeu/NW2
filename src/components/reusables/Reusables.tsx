import React, { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchWebSummary,
  clearSummary,
} from '../../state/slice/webSummarySlice'
import { AppDispatch, RootState } from '../../state'
import { setActivationNeeded, setPaymentModalInfo } from '../../state/slice/reusableStatesSlice'
import { selectWebSummaryState } from '../../state/selectors/webSummarySelectors'

interface ImageWithFallbackProps {
  src: string
  fallbackSrc: string
  alt: string
  styleString: string
  handleClick: (e: any) => void
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  fallbackSrc,
  alt,
  styleString,
  handleClick,
}) => {
  const [imgSrc, setImgSrc] = useState(src)

  const handleError = () => {
    setImgSrc(fallbackSrc)
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      onError={handleError}
      className={styleString}
      onClick={handleClick}
    />
  )
}

export function getFavicon(url: string) {
  try {
    const urlObj = new URL(url)
    return `${urlObj.origin}/favicon.ico`
  } catch {
    return 'localhost:3011/favicon.ico'
  }
}

export function openLink(url: string | undefined, openInNewTab: boolean) {
  if (openInNewTab) {
    chrome.tabs.create({ url })
  } else {
    chrome.tabs.update({ url })
  }
}

export function useWebSummary(url: string) {
  const [isLinkHovered, setIsLinkHovered] = useState(false);
  const [isSummaryHovered, setIsSummaryHovered] = useState(false);
  const showSummaryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideSummaryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const webSummaryState = useSelector((state: RootState) =>
    selectWebSummaryState(state, url)
  );

  const showWebSummary = isLinkHovered || isSummaryHovered;

  const handleLinkMouseEnter = () => {
    if (hideSummaryTimeoutRef.current) {
      clearTimeout(hideSummaryTimeoutRef.current);
      hideSummaryTimeoutRef.current = null;
    }

    if (!showSummaryTimeoutRef.current) {
      showSummaryTimeoutRef.current = setTimeout(() => {
        if (user && !user?.isSubscribed) {
          dispatch(setActivationNeeded(true));
          dispatch(
            setPaymentModalInfo(
              'You are on a free plan, upgrade to use this service!',
            ),
          );
        } else {
          setIsLinkHovered(true);
        }
        showSummaryTimeoutRef.current = null;
      }, 1000);
    }
  };

  const handleLinkMouseLeave = () => {
    if (showSummaryTimeoutRef.current) {
      clearTimeout(showSummaryTimeoutRef.current);
      showSummaryTimeoutRef.current = null;
    }
    setIsLinkHovered(false);
    if (!isSummaryHovered && !hideSummaryTimeoutRef.current) {
      hideSummaryTimeoutRef.current = setTimeout(() => {
        dispatch(clearSummary(url));
      }, 700);
    }
  };

  const handleSummaryMouseEnter = () => {
    if (hideSummaryTimeoutRef.current) {
      clearTimeout(hideSummaryTimeoutRef.current);
      hideSummaryTimeoutRef.current = null;
    }
    setIsSummaryHovered(true);
  };

  const handleSummaryMouseLeave = () => {
    setIsSummaryHovered(false);
    if (!isLinkHovered && !hideSummaryTimeoutRef.current) {
      hideSummaryTimeoutRef.current = setTimeout(() => {
        dispatch(clearSummary(url));
      }, 700);
    }
  };

  useEffect(() => {
    if (showWebSummary && !webSummaryState.summary && !webSummaryState.loading && !webSummaryState.error) {
      dispatch(fetchWebSummary(url));
    }

    return () => {
      if (showSummaryTimeoutRef.current) {
        clearTimeout(showSummaryTimeoutRef.current);
      }
      if (hideSummaryTimeoutRef.current) {
        clearTimeout(hideSummaryTimeoutRef.current);
      }
    };
  }, [showWebSummary, url, dispatch, webSummaryState.summary, webSummaryState.loading, webSummaryState.error]);

  return {
    showWebSummary,
    handleLinkMouseEnter,
    handleLinkMouseLeave,
    handleSummaryMouseEnter,
    handleSummaryMouseLeave,
    webSummaryResult: webSummaryState.summary,
    webSummaryLoading: webSummaryState.loading,
    webSummaryError: webSummaryState.error,
  };
}

export const getChromeStorage = (keys: string) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(keys, (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError)
      } else {
        resolve(result[keys])
      }
    })
  })
}

interface BookmarkNode {
  id: string;
  title: string;
  url?: string;
  parentId?: string;
  children?: BookmarkNode[];
  dateAdded?: number;
  dateGroupModified?: number;
}

interface BookmarkInput {
  title: string;
  url: string;
  folderName?: string;
}

export async function addBookmarksIfNotExist(bookmarks: BookmarkInput[]): Promise<void> {
  try {
      const quickSearchFolder = await retrieveQuickSearchFolderTree();
      
      if (!quickSearchFolder) {
          // console.error('QuickSearch folder not found');
          return;
      }

      const folders = processFolders([quickSearchFolder]);

      for (const bookmark of bookmarks) {
          const folderName = bookmark.folderName || '';
          let targetFolder = folders.find((f) => f.title === folderName);

          if (!targetFolder && folderName) {
              targetFolder = await createFolder(quickSearchFolder.id, folderName);
              folders.push(targetFolder);
          }

          const parentId = targetFolder ? targetFolder.id : quickSearchFolder.id;
          await addBookmarkIfNotExist(parentId, bookmark);
      }
  } catch (error) {
      console.error('Error in addBookmarksIfNotExist:', error);
      throw error;
  }
}

export async function retrieveQuickSearchFolderTree(): Promise<BookmarkNode | null> {
  return new Promise((resolve) => {
      chrome.bookmarks.getTree((bookmarkTreeNodes: BookmarkNode[]) => {
          const quickSearchFolder = findFolderByName(bookmarkTreeNodes, 'QuickSearch');
          resolve(quickSearchFolder);
      });
  });
}

function processFolders(nodes: BookmarkNode[]): BookmarkNode[] {
  const folders: BookmarkNode[] = [];
  
  for (const node of nodes) {
      if (!node.url) {
          folders.push(node);
          if (node.children) {
              folders.push(...processFolders(node.children));
          }
      }
  }
  
  return folders;
}

async function createFolder(parentId: string, folderName: string): Promise<BookmarkNode> {
  return new Promise((resolve) => {
      chrome.bookmarks.create(
          {
              parentId,
              title: folderName,
          },
          (newFolder: BookmarkNode) => {
              resolve(newFolder);
          }
      );
  });
}

async function addBookmarkIfNotExist(folderId: string, bookmark: BookmarkInput): Promise<void> {
  return new Promise((resolve) => {
      chrome.bookmarks.getChildren(folderId, (children: BookmarkNode[]) => {
          const existingBookmark = children.find(
              (child) => child.title === bookmark.title && child.url === bookmark.url
          );
          
          if (!existingBookmark) {
              chrome.bookmarks.create({
                  parentId: folderId,
                  title: bookmark.title,
                  url: bookmark.url,
              }, () => {
                  resolve();
              });
          } else {
              resolve();
          }
      });
  });
}

function findFolderByName(nodes: BookmarkNode[], folderName: string): BookmarkNode | null {
  for (const node of nodes) {
      if (node.title === folderName && !node.url) {
          return node;
      }
      if (node.children) {
          const found = findFolderByName(node.children, folderName);
          if (found) {
              return found;
          }
      }
  }
  return null;
}