import React from 'react'
import { ChildFolder, Folder } from '../../state/types/folder'
import { Bookmark, ChildBookmarks } from '../../state/types/bookmark';
import { retrieveQuickSearchFolderTree } from '../../components/reusables/Reusables';

declare global {
  interface Window {
    hasLoggedAllFolders?: boolean
  }
}

export interface ExtractedQuery {
  searchQuery: string;
  isGoogle: boolean;
  isGoogleScholar: boolean;
  isUsed: boolean;
  dateAdded: string;
  url: string;
}

export interface ExtractedCurrentTab {
  url: string | null
  title: string | null
  favicon: string | null
  screenshot: string | null
  restricted: boolean
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

export const setChromeStorage = <T>(key: string, value: T): Promise<void> => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [key]: value }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
};

export const removeChromeStorage = (key: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.remove(key, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
};


interface DebouncedFunction<T extends (...args: any[]) => void> {
  (this: ThisParameterType<T>, ...args: Parameters<T>): void
}

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number,
): DebouncedFunction<T> {
  let timeout: NodeJS.Timeout
  return function (this: ThisParameterType<T>, ...args: Parameters<T>): void {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  }
}

interface BookmarkNode {
  id: string
  title: string
  url?: string
  children?: BookmarkNode[]
  parentId?: string
}

export const bookmarkFoldersUpdate = debounce(async function () {
  if (chrome && chrome.bookmarks) {
    setTimeout(async () => {
      const allFolders: Folder[] = (await getChromeStorage(
        'allFolders',
      )) as Folder[]

      if (!window.hasLoggedAllFolders) {
        window.hasLoggedAllFolders = true

        await retrieveOrCreateFolder(
          'QuickSearch',
          async function (quickSearchFolder: BookmarkNode) {
            const quickSearchFolders = (await fetchQuickSearchSubFolders(
              quickSearchFolder.id,
            )) as BookmarkNode[]

            for (let folder of allFolders) {
              const folderExists = quickSearchFolders.some(
                (fd) => fd.title === folder.name,
              )

              if (!folderExists) {
                if (folder.parentFolder === '/') {
                  setTimeout(
                    () => createSubFolder(quickSearchFolder.id, folder.name),
                    200,
                  )
                } else {
                  let parentFolder = quickSearchFolders.find(
                    (fd) => fd.title === folder.parentFolder,
                  )

                  if (!parentFolder) {
                    parentFolder = await createSubFolderAsync(
                      quickSearchFolder.id,
                      folder.parentFolder,
                    )
                  }
                  setTimeout(
                    () => createSubFolder(parentFolder.id, folder.name),
                    200,
                  )
                }
              }
            }
          },
        )
      }
    }, 200)
  } else {
    console.log('Bookmarks API not available')
  }
}, 500)

async function retrieveOrCreateFolder(
  folderName: string,
  callback: (folder: BookmarkNode) => void,
): Promise<void> {
  chrome.bookmarks.search(
    { title: folderName },
    function (results: BookmarkNode[]) {
      let folder = results.find(
        (result) => result.title === folderName && result.url === undefined,
      )
      if (folder) {
        callback(folder)
      } else {
        chrome.bookmarks.create(
          { title: folderName },
          function (result: BookmarkNode) {
            callback(result)
          },
        )
      }
    },
  )
}

function fetchQuickSearchSubFolders(
  quickSearchFolderId: string,
): Promise<BookmarkNode[]> {
  return new Promise((resolve) => {
    chrome.bookmarks.getSubTree(
      quickSearchFolderId,
      function (bookmarkTreeNodes: BookmarkNode[]) {
        const folders = processAllFolders(bookmarkTreeNodes[0].children)
        resolve(folders)
      },
    )
  })
}

function createSubFolder(
  parentId: string,
  folderName: string,
  callback?: (folder: BookmarkNode) => void,
): void {
  chrome.bookmarks.create(
    { parentId: parentId, title: folderName },
    function (folder: BookmarkNode) {
      if (callback) callback(folder)
    },
  )
}

function createSubFolderAsync(
  parentId: string,
  folderName: string,
): Promise<BookmarkNode> {
  return new Promise((resolve) => {
    createSubFolder(parentId, folderName, resolve)
  })
}

function processAllFolders(children?: BookmarkNode[]): BookmarkNode[] {
  const folders: BookmarkNode[] = []
  if (!children) return folders

  for (let child of children) {
    if (!child.url && child.children) {
      folders.push({ id: child.id, title: child.title })
    }
    if (child.children) {
      folders.push(...processAllFolders(child.children))
    }
  }
  return folders
}

export const getExtractedQuery = async (): Promise<ExtractedQuery | null> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(
      ['extractedGoogleQueryDetails', 'extractedScholarQueryDetails'],
      (result) => {
        if (chrome.runtime.lastError) {
          console.error('Error fetching extracted query:', chrome.runtime.lastError);
          resolve(null);
          return;
        }

        const googleQuery = result.extractedGoogleQueryDetails as ExtractedQuery;
        const scholarQuery = result.extractedScholarQueryDetails as ExtractedQuery;

        if (googleQuery && scholarQuery) {
          const googleDate = new Date(googleQuery.dateAdded);
          const scholarDate = new Date(scholarQuery.dateAdded);
          resolve(
            googleDate > scholarDate ? googleQuery : scholarQuery,
          );
        } else if (googleQuery) {
          resolve(googleQuery);
        } else if (scholarQuery) {
          resolve(scholarQuery);
        } else {
          resolve(null);
        }
      },
    );
  });
};

export const getExtractedCurrentTab = async (): Promise<ExtractedCurrentTab | null> => {
  return new Promise((resolve) => {
    chrome.storage.local.get('currentTabData', (result) => {
      if (chrome.runtime.lastError) {
        console.error('Error fetching extracted current tab:', chrome.runtime.lastError);
        resolve(null);
        return;
      }
      const currentTabData = result.currentTabData
      if (currentTabData) {
        resolve(currentTabData)
      } else {
        resolve(null)
      }
    })
  })
}

export async function tabScreenshotCaptureForSider() {
  try {
    // Request permission before capturing
    const granted = await new Promise((resolve) => {
      chrome.permissions.request(
        {
          permissions: ["tabs"],
          origins: ["<all_urls>"]
        },
        (granted) => resolve(granted)
      )
    });

    if (!granted) {
      throw new Error("Permission not granted");
    }

    const screenshotUrl = await captureTabScreenshot();
    return screenshotUrl;
  } catch (error) {
    console.error("Error capturing screenshot:", error);
    throw error;
  }

  function captureTabScreenshot() {
    return new Promise((resolve, reject) => {
      chrome.tabs.captureVisibleTab(
        chrome.windows.WINDOW_ID_CURRENT,
        { format: "png" },
        (dataUrl) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError.message);
          } else {
            resolve(dataUrl);
          }
        }
      );
    });
  }
}


export function isValidUrlForSider(url: string | undefined) {
  return url && (url.startsWith('http://') || url.startsWith('https://'))
}

export async function getChildBookmarks(folderName: string, bookmarks: Bookmark[]): Promise<ChildBookmarks[]> {
  if (!Array.isArray(bookmarks) || bookmarks.length === 0) {
    return []
  }

  const moderatedName = folderName === '/' ? '' : folderName

  return bookmarks
    .filter((bookmark) => bookmark.folderName === moderatedName)
    .map((bookmark) => ({
      id: bookmark.id,
      imgUrl: bookmark.imgUrl,
      title: bookmark.title,
      url: bookmark.url,
      source: bookmark.source,
      date: bookmark.date,
    }))
}

export async function getChildFolders(folderName: string, folders: Folder[]): Promise<ChildFolder[]> {
  if (!Array.isArray(folders) || folders.length === 0) {
    return []
  }

  const moderatedName = folderName === '' ? '/' : folderName

  return folders
    .filter((folder) => folder.parentFolder === moderatedName)
    .map((folder) => ({
      id: folder.id,
      name: folder.name,
      dateAdded: Date.now().toString()
    }))
}

export async function getParentFolders(folderName: string, folders: Folder[]): Promise<string[]> {
  const result = []
  let currentFolder =
    Array.isArray(folders) &&
    folders.length > 0 &&
    folders.find((folder) => folder.name === folderName)

  while (currentFolder) {
    const parentFolderName = currentFolder.parentFolder
    if (parentFolderName) {
      result.unshift(parentFolderName)
    }
    currentFolder = folders.find((folder) => folder.name === parentFolderName)
  }

  result.push(folderName)

  return result
}

export const logoutCleanup = async () => {
  const keysToRemove = [
    'auth',
    'allBookmarks',
    'collectionBookmarks',
    'selectedBookmarkParentName',
    'allArticles',
    'activeCardList',
    'allFavorites',
    'allFolders',
    'collectionFolders',
    'collectionFolderAncestors',
    'allImages',
    'openInNewTab',
    'filteredMedia',
    'isFilteredMedia',
    'filteredMediaTitle',
    'filteredMediaId',
    'searchEngine',
    'activeSection',
    'allVideos',
    'chatModelDetail'
  ];

  try {
    chrome.storage.local.remove(keysToRemove);
  } catch (err) {
    console.error('Error removing chrome storage items:', err);
  }

  try {
    const folder = await retrieveQuickSearchFolderTree();
    if (folder?.id) {
      chrome.bookmarks.removeTree(folder.id);
    }
  } catch (err) {
    console.error('Error removing QuickSearch folder:', err);
  }
};

export const getDateAdded = (date: Date) => {
  function getDaySuffix(day: number) {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  }

  const weekday = date.toLocaleString('en-US', { weekday: 'long' });
  const day = date.getDate();
  const suffix = getDaySuffix(day);
  const year = date.getFullYear();

  
  const time = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return `${weekday} ${day}${suffix}, ${year} at ${time}`;
}