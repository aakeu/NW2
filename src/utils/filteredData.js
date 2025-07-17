import { get_all_articles } from '../api/articles.js'
import { get_all_bookmarks, get_all_favorites } from '../api/bookmark.js'
import { get_all_images } from '../api/images.ts'
import { get_all_videos } from '../api/videos.js'
import { addBookmarksIfNotExist } from './addBookmarksIfNotExist.js'
import { setChromeStorage } from './utility.tsx'

export async function filteredBookmarksData() {
  let bookmarksData = await get_all_bookmarks()
  const uniqueBookmarks = []
  const titlesSet = new Set()

  Array.isArray(bookmarksData) &&
    bookmarksData.length > 0 &&
    bookmarksData.forEach((bookmark) => {
      if (!titlesSet.has(bookmark.title)) {
        uniqueBookmarks.push(bookmark)
        titlesSet.add(bookmark.title)
      }
    })

  bookmarksData = uniqueBookmarks

  await setChromeStorage({ allBookmarks: bookmarksData })

  await addBookmarksIfNotExist(bookmarksData)
}

export async function filteredFavoritesData() {
  let favoritesData = await get_all_favorites()
  const uniqueFavorites = []
  const titlesSet = new Set()

  Array.isArray(favoritesData) &&
    favoritesData.length > 0 &&
    favoritesData.forEach((favorite) => {
      if (!titlesSet.has(favorite.title)) {
        uniqueFavorites.push(favorite)
        titlesSet.add(favorite.title)
      }
    })

  favoritesData = uniqueFavorites

  await setChromeStorage({ allFavorites: favoritesData })
}

export async function filteredImagesData() {
  let imagesData = await get_all_images()
  const uniqueImages = []
  const imagesFolderNameSet = new Set()

  Array.isArray(imagesData) &&
    imagesData.length > 0 &&
    imagesData.forEach((image) => {
      if (!imagesFolderNameSet.has(image.imageFolderName)) {
        uniqueImages.push(image)
        imagesFolderNameSet.add(image.imageFolderName)
      }
    })

  imagesData = uniqueImages

  await setChromeStorage({ allImages: imagesData })
}

export async function filteredVideosData() {
  let videosData = await get_all_videos()
  const uniqueVideos = []
  const videosFolderNameSet = new Set()

  Array.isArray(videosData) &&
    videosData.length > 0 &&
    videosData.forEach((video) => {
      if (!videosFolderNameSet.has(video.videoFolderName)) {
        uniqueVideos.push(video)
        videosFolderNameSet.add(video.videoFolderName)
      }
    })

  videosData = uniqueVideos

  await setChromeStorage({ allVideos: videosData })
}

export async function filteredArticlesData() {
  let articlesData = await get_all_articles()
  const uniqueArticles = []
  const articlesFolderNameSet = new Set()

  Array.isArray(articlesData) &&
    articlesData.length > 0 &&
    articlesData.forEach((article) => {
      if (!articlesFolderNameSet.has(article.articleFolderName)) {
        uniqueArticles.push(article)
        articlesFolderNameSet.add(article.articleFolderName)
      }
    })

  articlesData = uniqueArticles

  await setChromeStorage({ allArticles: articlesData })
}
