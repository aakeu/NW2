import React, { useEffect, useState, useRef } from 'react'
import { web_summary } from '../api/google_api'

/**
 * Custom hook to handle the show and hide logic for web summaries with delay.
 * @param {string} url - URL to fetch the web summary for.
 * @param {number} showDelay - Delay in milliseconds for showing the summary (default 700ms).
 * @param {number} hideDelay - Delay in milliseconds for hiding the summary (default 200ms).
 * @returns {Object} - Object containing state and handlers for show/hide actions.
 */
export function useWebSummary(url:string) {
  const [showWebSummary, setShowWebSummary] = useState(false)
  const [webSummaryResult, setWebSummaryResult] = useState(null)
  const [webSummaryLoading, setWebSummaryLoading] = useState(false)
  const showSummaryTimeoutRef = useRef<any>(null)

  const handleShowWebSummary = () => {
    if (showSummaryTimeoutRef.current) {
      clearTimeout(showSummaryTimeoutRef.current)
    }
    showSummaryTimeoutRef.current = setTimeout(() => {
      setShowWebSummary(true)
    }, 700)
  }

  const handleHideWebSummary = () => {
    if (showSummaryTimeoutRef.current) {
      clearTimeout(showSummaryTimeoutRef.current)
      showSummaryTimeoutRef.current = null
    }
    setTimeout(() => {
      setShowWebSummary(false)
    }, 700)
  }

  useEffect(() => {
    async function getWebSummaryResult() {
      if (!showWebSummary || webSummaryResult) return

      setWebSummaryLoading(true)
      try {
        const data = await web_summary(url)
        setWebSummaryResult(data)
      } catch (error) {
        console.error('Error fetching web summary:', error)
      } finally {
        setWebSummaryLoading(false)
      }
    }

    getWebSummaryResult()
  }, [showWebSummary])

  return {
    showWebSummary,
    handleShowWebSummary,
    handleHideWebSummary,
    webSummaryResult,
    webSummaryLoading,
  }
}

export function MoreFeatures({ onClick, text }:{onClick:(e:any)=>void; text:string}) {
  return (
    <div onClick={onClick} className="chatGptMoreFeatures">
      {text}
    </div>
  )
}

export function handleFeatures() {
  const [openMoreFeatures, setOpenMoreFeatures] = useState(false)
  const openMoreFeaturesTimeoutRef = useRef<any>(null)

  const handleOpenMoreFeatures = async () => {
    openMoreFeaturesTimeoutRef.current = setTimeout(() => {
      setOpenMoreFeatures(true)
    }, 500)
  }

  return {
    openMoreFeatures,
    handleOpenMoreFeatures,
    setOpenMoreFeatures,
  }
}

export async function getGSearchValue() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['g-search'], (result) => {
      resolve(result['g-search'] || null)
    })
  })
}

export async function getStoredQuery() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['storedQuery'], (result) => {
      resolve(result['storedQuery'] || null)
    })
  })
}

export async function getScholarStoredQuery() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['scholarStoredQuery'], (result) => {
      resolve(result['scholarStoredQuery'] || null)
    })
  })
}

export async function getGooglePhaseCache() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['googlePhaseCache'], (result) => {
      resolve(result['googlePhaseCache'] || null)
    })
  })
}
export async function getUseExtraction() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['useExtraction'], (result) => {
      resolve(result['useExtraction'] || null)
    })
  })
}

export async function getGoogleScholarPhaseCache() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['googleScholarPhaseCache'], (result) => {
      resolve(result['googleScholarPhaseCache'] || null)
    })
  })
}

export const getExtractedQuery = () => {
  return new Promise((resolve) => {
    chrome.storage.local.get(
      ['extractedGoogleQueryDetails', 'extractedScholarQueryDetails'],
      (result) => {
        if (chrome.runtime.lastError) {
          console.error('Error fetching extracted query:', chrome.runtime.lastError);
          resolve(null);
          return;
        }

        const googleQuery = result.extractedGoogleQueryDetails;
        const scholarQuery = result.extractedScholarQueryDetails;

        if (googleQuery && scholarQuery) {
          const googleDate = new Date(googleQuery.dateAdded);
          const scholarDate = new Date(scholarQuery.dateAdded);
          resolve(googleDate > scholarDate ? googleQuery : scholarQuery);
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

export function openLink(url:string, openInNewTab:boolean) {
  if (openInNewTab) {
    chrome.tabs.create({ url })
  } else {
    chrome.tabs.update({ url })
  }
}

export const ImageWithFallback = ({
  src,
  fallbackSrc,
  alt,
  styleString,
  handleClick,
}:{
  src:string,
  fallbackSrc:string;
  alt:string;
  styleString:string;
  handleClick:(e:any)=>void
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

export function Spinner() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1.2em"
      height="1.2em"
      viewBox="0 0 24 24"
      className="generalBookmarkSpinner"
    >
      <g fill="#034aa6">
        <path
          fillRule="evenodd"
          d="M12 19a7 7 0 1 0 0-14a7 7 0 0 0 0 14m0 3c5.523 0 10-4.477 10-10S17.523 2 12 2S2 6.477 2 12s4.477 10 10 10"
          clipRule="evenodd"
          opacity={0.2}
        ></path>
        <path d="M12 22c5.523 0 10-4.477 10-10h-3a7 7 0 0 1-7 7zM2 12C2 6.477 6.477 2 12 2v3a7 7 0 0 0-7 7z"></path>
      </g>
    </svg>
  )
}

export const setChromeStorage = (data:any) => {
  return new Promise<void>((resolve, reject) => {
    chrome.storage.local.set(data, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError)
      } else {
        resolve()
      }
    })
  })
}

export const getChromeStorage = (keys:string) => {
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

export const removeChromeStorage = (keys:string) => {
  return new Promise<void>((resolve, reject) => {
    chrome.storage.local.remove(keys, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError)
      } else {
        resolve()
      }
    })
  })
}

async function retrieveOrCreateFolder(folderName:string, callback:(...arg:any[])=>void) {
  chrome.bookmarks.search({ title: folderName }, function (results) {
    let folder = results.find(
      (result) => result.title === folderName && result.url === undefined,
    )
    if (folder) {
      callback(folder)
    } else {
      chrome.bookmarks.create({ title: folderName }, function (result) {
        callback(result)
      })
    }
  })
}

function fetchQuickSearchSubFolders(quickSearchFolderId:string) {
  return new Promise<any>((resolve) => {
    chrome.bookmarks.getSubTree(
      quickSearchFolderId,
      function (bookmarkTreeNodes) {
        const folders = processAllFolders(bookmarkTreeNodes[0].children)
        resolve(folders)
      },
    )
  })
}

function processAllFolders(children:any):any[] {
  const folders = []
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

function debounce<T extends (...args: any[]) => void>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;

  return function (...args: Parameters<T>) {
    clearTimeout(timeout);
    // timeout = setTimeout(() => func.apply(this, args), wait);
    timeout = setTimeout(() => func.apply(args), wait);
  };
}


export const bookmarkFoldersUpdate = debounce(async function () {
  if (chrome && chrome.bookmarks) {
    setTimeout(async () => {
      const allFolders = (await getChromeStorage('allFolders')) as any

      if (!window.hasLoggedAllFolders) {
        window.hasLoggedAllFolders = true

        await retrieveOrCreateFolder(
          'QuickSearch',
          async function (quickSearchFolder) {
            const quickSearchFolders = await fetchQuickSearchSubFolders(
              quickSearchFolder.id,
            )

            // console.log('quicksearch subfolders', quickSearchFolders)

            for (let folder of allFolders) {
              const folderExists = quickSearchFolders.some(
                (fd:any) => fd.title === folder.name,
              )
              // console.log('folder exists', folderExists)
              // console.log('folder to add', folder)

              if (!folderExists) {
                // Handle root-level folders
                if (folder.parentFolder === '/') {
                  setTimeout(
                    () => createSubFolder(quickSearchFolder.id, folder.name),
                    200,
                  )
                } else {
                  // Handle nested folders
                  let parentFolder = quickSearchFolders.find(
                    (fd:any) => fd.title === folder.parentFolder,
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

function createSubFolder(parentId:string, folderName:string, callback?:(...args:any[])=>void) {
  chrome.bookmarks.create(
    { parentId: parentId, title: folderName },
    function (folder) {
      // console.log(folderName + ' folder created')
      if (callback) callback(folder)
    },
  )
}

function createSubFolderAsync(parentId:string, folderName:string) {
  return new Promise((resolve) => {
    createSubFolder(parentId, folderName, resolve)
  })
}

export async function deleteQuickSearchFolder() {
  chrome.bookmarks.search({ title: 'QuickSearch' }, function (results) {
    if (results && results.length > 0) {
      const quickSearchFolder = results.find(
        (folder) => folder.title === 'QuickSearch',
      )

      if (quickSearchFolder) {
        chrome.bookmarks.getChildren(quickSearchFolder.id, function (children) {
          children.forEach(function (child) {
            chrome.bookmarks.removeTree(child.id)
          })

          chrome.bookmarks.remove(quickSearchFolder.id, function () {
            // console.log(
            //   'QuickSearch folder and all its contents have been deleted.',
            // )
          })
        })
      } else {
        console.log('QuickSearch folder not found.')
      }
    } else {
      console.log('QuickSearch folder not found.')
    }
  })
}

export const populateDefaultFolders = debounce(async function () {
  if (chrome && chrome.bookmarks) {
    const allFolders = (await getChromeStorage('allFolders')) as any
    if ((!window as any).populateDefaultFolders) {
      chrome.bookmarks.search({ title: 'QuickSearch' }, function (results) {
        if (results.length === 0 || results[0].title !== 'QuickSearch') {
          chrome.bookmarks.create({ title: 'QuickSearch' }, function (folder) {
            const defaultFolders = ['links', 'images', 'videos', 'articles']
            allFolders
              .filter((fd:any) => defaultFolders.includes(fd.name.toLowerCase()))
              .map((data:any) =>
                setTimeout(() => createASubFolder(folder.id, data.name), 200),
              )
          })
        }
      });
      (window as any).populateDefaultFolders = true
    }
  }
}, 500)

async function createDefaultSubfolders(parentId:string, allFolders:string) {
  const defaultFolders = ['links', 'images', 'videos', 'articles']

  const existingFolders = await new Promise<any>((resolve) =>
    chrome.bookmarks.getChildren(parentId, resolve),
  )
  const existingTitles = existingFolders.map((folder:any) =>
    folder.title.trim().toLowerCase(),
  )

  const foldersToCreate = defaultFolders.filter(
    (name) => !existingTitles.includes(name),
  )

  for (const folder of foldersToCreate) {
    await createASubFolder(parentId, folder)
  }
}

async function createASubFolder(parentId:string, folderName:string) {
  chrome.bookmarks.create(
    { parentId: parentId, title: folderName },
    function (folder) {
      // console.log(folderName + ' folder created')
    },
  )
}

export async function getFoldersInQuickSearch() {
  if (!chrome || !chrome.bookmarks) {
    console.log('Bookmarks API not available')
    return []
  }

  return new Promise((resolve, reject) => {
    chrome.bookmarks.search({ title: 'QuickSearch' }, function (results) {
      if (results.length > 0) {
        const quicksearchFolderId = results[0].id
        chrome.bookmarks.getChildren(quicksearchFolderId, function (children) {
          console.log('all children', children)
          resolve(children)
        })
      } else {
        console.error('QuickSearch folder not found')
        resolve([])
      }
    })
  })
}

export async function removeSubFoldersInQuickSearch() {
  if (!chrome || !chrome.bookmarks) {
    console.log('Bookmarks API not available')
    return
  }

  chrome.bookmarks.search({ title: 'QuickSearch' }, function (results) {
    if (results && results.length > 0) {
      const quickSearchFolder = results.find(
        (folder) => folder.title === 'QuickSearch',
      )

      if (quickSearchFolder) {
        chrome.bookmarks.getChildren(quickSearchFolder.id, function (children) {
          if (children && children.length > 0) {
            children.forEach(function (child) {
              console.log(
                `Attempting to delete folder: ${child.title} (ID: ${child.id})`,
              )
              chrome.bookmarks.removeTree(child.id, function () {
                if (chrome.runtime.lastError) {
                  console.error(
                    `Error removing folder ${child.id}:`,
                    chrome.runtime.lastError.message,
                  )
                } else {
                  console.log(`Successfully deleted folder: ${child.title}`)
                }
              })
            })
          } else {
            console.log('No subfolders found inside QuickSearch.')
          }
        })
      } else {
        console.log('QuickSearch folder not found.')
      }
    } else {
      console.log('QuickSearch folder not found.')
    }
  })
}

export function isValidUrl(url:string) {
  return url && (url.startsWith('http://') || url.startsWith('https://'))
}

export const profileFeaturesPart1 = [
  {
    img: 'images/popup/gptIcon.svg',
    text: 'GPT',
    icon1: 'images/popup/cross.svg',
    icon2: '',
  },
  {
    img: 'images/popup/promptIcon.svg',
    text: 'Prompt summary  from GPT',
    icon1: 'images/popup/tick.svg',
    icon2: '',
  },
  {
    img: 'images/popup/saveLinksIcon.svg',
    text: 'Save 50+ links',
    icon1: 'images/popup/saveLinkSymbol.svg',
    icon2: 'images/popup/cross.svg',
  },
  {
    img: 'images/popup/googleIcon.svg',
    text: 'Google search',
    icon1: 'images/popup/tick.svg',
    icon2: '',
  },
  {
    img: 'images/popup/googleScholarIcon.svg',
    text: 'Google scholar',
    icon1: 'images/popup/cross.svg',
    icon2: '',
  },
]
export const profileFeaturesPart2 = [
  {
    img: 'images/popup/saveGptIcon.svg',
    text: 'Save GPT response',
    icon1: 'images/popup/cross.svg',
    icon2: '',
  },
  {
    img: 'images/popup/saveTabsIcon.svg',
    text: 'Save tabs',
    icon1: 'images/popup/saveLinkSymbol.svg',
    icon2: 'images/popup/tick.svg',
  },
  {
    img: 'images/popup/cloudIcon.svg',
    text: 'Image upload',
    icon1: 'images/popup/cross.svg',
    icon2: '',
  },
  {
    img: 'images/popup/bookmarkProfIcon.svg',
    text: 'Bookmark',
    icon1: 'images/popup/saveLinkSymbol.svg',
    icon2: 'images/popup/tick.svg',
  },
]

export const accountUsage1 = [
  {
    name: 'Coin Summary',
    value: 20,
  },
  {
    name: 'GPT Search',
    value: 0,
  },
]
export const accountUsage2 = [
  {
    name: 'Google Search',
    value: 0,
  },
  {
    name: 'Image Upload',
    value: 0,
  },
]

export const chatGptPredefined = [
  {
    action: 'Try it out',
    text: 'How to make my day awesome',
  },
  {
    action: 'Try it out',
    text: 'How to be a good host',
  },
  {
    action: 'Try it out',
    text: 'Help create a plan for healthy eating',
  },
  {
    action: 'Try it out',
    text: 'Tips on work-life balance',
  },
  {
    action: 'Try it out',
    text: 'Tell me a fun fact of the day',
  },
  {
    action: 'Try it out',
    text: 'Ideas on creating Tik-Tok content',
  },
]

export const chatGptImgIcons = [
  {
    name: 'undo',
    img: 'images/undo.svg',
  },
  {
    name: 'redo',
    img: 'images/redo.svg',
  },
  {
    name: 'font',
    img: 'images/textIcon.svg',
  },
  {
    name: 'separator',
    img: 'images/separator.svg',
  },
  {
    name: 'bold',
    img: 'images/bold.svg',
  },
  {
    name: 'italic',
    img: 'images/italic.svg',
  },
  {
    name: 'underline',
    img: 'images/underline.svg',
  },
]

export function getRandomNumber(min = 1, max = 100) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function summaryTexts() {
  const data = [
    'Summarize my lease agreement',
    'Summarize notes from a meeting',
    'Summarize chapter 1 of a book',
    'Summarize a research paper',
  ]
  return data
}

export function generateTexts() {
  const data = [
    'Generate company logo',
    'Generate UI Design',
  ]
  return data
}

export function languages() {
  const data = ['Auto Detect', 'English', 'Japanese', 'Chinese', 'Arabic']
  return data
}
