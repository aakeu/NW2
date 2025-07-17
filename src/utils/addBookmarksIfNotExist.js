export async function addBookmarksIfNotExist(bookmarks) {
  retrieveQuickSearchFolderTree(async (quickSearchFolder) => {
    if (!quickSearchFolder) {
      // console.error('QuickSearch folder not found')
      return
    }

    const folders = processFolders([quickSearchFolder])

    for (let bookmark of bookmarks) {
      let folderName = bookmark.folderName || ''
      let targetFolder = folders.find((f) => f.title === folderName)

      if (!targetFolder && folderName) {
        // Create the folder if it doesn't exist
        targetFolder = await createFolder(quickSearchFolder.id, folderName)
        folders.push(targetFolder)
      }

      let parentId = targetFolder ? targetFolder.id : quickSearchFolder.id
      addBookmarkIfNotExist(parentId, bookmark)
    }
  })
}

function retrieveQuickSearchFolderTree(callback) {
  chrome.bookmarks.getTree(function (bookmarkTreeNodes) {
    const quickSearchFolder = findFolderByName(bookmarkTreeNodes, 'QuickSearch')
    if (quickSearchFolder) {
      callback(quickSearchFolder)
    } else {
      callback(null)
    }
  })
}

function processFolders(nodes) {
  const folders = []
  for (let node of nodes) {
    if (!node.url) {
      folders.push(node)
      if (node.children) {
        folders.push(...processFolders(node.children))
      }
    }
  }
  return folders
}

function createFolder(parentId, folderName) {
  return new Promise((resolve) => {
    chrome.bookmarks.create(
      {
        parentId: parentId,
        title: folderName,
      },
      function (newFolder) {
        resolve(newFolder)
      },
    )
  })
}

function addBookmarkIfNotExist(folderId, bookmark) {
  chrome.bookmarks.getChildren(folderId, function (children) {
    const existingBookmark = children.find(
      (child) => child.title === bookmark.title && child.url === bookmark.url,
    )
    if (!existingBookmark) {
      chrome.bookmarks.create({
        parentId: folderId,
        title: bookmark.title,
        url: bookmark.url,
      })
    }
  })
}

function findFolderByName(nodes, folderName) {
  for (let node of nodes) {
    if (node.title === folderName && !node.url) {
      return node
    }
    if (node.children) {
      const found = findFolderByName(node.children, folderName)
      if (found) {
        return found
      }
    }
  }
  return null
}
