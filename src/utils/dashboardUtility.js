import { openLink, setChromeStorage } from './utility.tsx'

export async function getParentFolders(folderName, folders) {
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

export async function getChildFolders(folderName, folders) {
  if (!Array.isArray(folders) || folders.length === 0) {
    return []
  }

  return folders
    .filter((folder) => folder.parentFolder === folderName)
    .map((folder) => ({
      id: folder.id,
      name: folder.name,
    }))
}

export async function getChildBookmarks(folderName, bookmarks) {
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
    }))
}

export const handleFolderClick = async (
  folderName,
  allFolders,
  allBookmarks,
) => {
  try {
    const ancestorFolders = await getParentFolders(folderName, allFolders)
    const folders = await getChildFolders(folderName, allFolders)
    const bookmarks = await getChildBookmarks(folderName, allBookmarks)

    await setChromeStorage({ selectedBookmarkParentName: folderName })

    await setChromeStorage({ collectionFolders: folders })
    await setChromeStorage({ collectionFolderAncestors: ancestorFolders })
    await setChromeStorage({ collectionFolderBookmarks: bookmarks })

    if (chrome?.runtime?.sendMessage) {
      chrome.runtime.sendMessage({ type: 'DASHBOARD_COLLECTION_FOLDERS' })
      chrome.runtime.sendMessage({
        type: 'DASHBOARD_COLLECTION_ANCESTOR_FOLDERS',
      })
      chrome.runtime.sendMessage({
        type: 'DASHBOARD_COLLECTION_FOLDERS_BOOKMARKS',
      })
      chrome.runtime.sendMessage({
        type: 'SELECTED_BOOKMARK_PARENT_NAME',
      })
    }
  } catch (error) {
    // console.error('Error in handleFolderClick:', error)
  }
}

export const handleDashboardImageDetailSettings = async (
  imageFolderName,
  imageUrl,
  isHome,
  id,
) => {
  const imgDetail = {
    imageFolderName,
    imageUrl,
    isHome,
    id,
  }
  await setChromeStorage({ dashboardImgDetail: imgDetail })
  if (chrome?.runtime?.sendMessage) {
    chrome.runtime.sendMessage({ type: 'DASHBOARD_IMAGE_DETAIL' })
  }
}

export const handleDashboardArticleDetailSettings = async (
  articleFolderName,
  articleUrl,
  isHome,
  id,
) => {
  const artDetail = {
    articleFolderName,
    articleUrl,
    isHome,
    id,
  }
  await setChromeStorage({ dashboardArtDetail: artDetail })
  if (chrome?.runtime?.sendMessage) {
    chrome.runtime.sendMessage({ type: 'DASHBOARD_ARTICLE_DETAIL' })
  }
}

export const handleDashboardVideoDetailSettings = async (
  videoFolderName,
  videoUrl,
  isHome,
  id,
) => {
  const vidDetail = {
    videoFolderName,
    videoUrl,
    isHome,
    id,
  }
  await setChromeStorage({ dashboardVidDetail: vidDetail })
  if (chrome?.runtime?.sendMessage) {
    chrome.runtime.sendMessage({ type: 'DASHBOARD_VIDEO_DETAIL' })
  }
}

export const viewDashboardFile = async (url) => {
  openLink(url, true)
}

export const downloadDashboardFile = async (url) => {
  chrome.runtime.sendMessage({
    action: 'downloadImage',
    url: url,
    filename: 'image-file',
  })
}
