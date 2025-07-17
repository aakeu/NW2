import React, { useEffect, useState } from 'react'
import '../dashboard/DashboardSection.css'
import { useDebounce, useThrottle } from '../../utils/debounceAndThrottle'

export default function DashboardSearchInput({
  selectedBookmarkParentName,
  allFolders,
  allBookmarks,
  setSearchCollectionBookmarkResults,
  setSearchCollectionFolderResults,
  setCollectionFolders,
  setCollectionFolderBookmarks,
  query,
  setQuery,
  dashboardSection,
  allFavorites,
  setSearchFavoriteResults,
  setSearchLinksResults,
  setSearchImagesResults,
  allImages,
  existingDashboardImageDetail,
  setSearchVideosResults,
  allVideos,
  existingDashboardVideoDetail,
  setSearchArticlesResults,
  allArticles,
  existingDashboardArticleDetail,
}) {
  const debouncedQuery = useDebounce(query, 500)

  const fetchResults = async (searchTerm) => {
    if (typeof searchTerm !== 'string') {
      return
    }

    const parentFolderName = selectedBookmarkParentName || '/'
    const bookmarkFolderName = parentFolderName === '/' ? '' : parentFolderName

    if (!searchTerm) {
      if (dashboardSection === 'dashboardSectionCollections') {
        setCollectionFolders(allFolders)
        setCollectionFolderBookmarks(allBookmarks)
        setSearchCollectionBookmarkResults(null)
        setSearchCollectionFolderResults(null)
        return
      }
      if (dashboardSection === 'dashboardSectionFavorites') {
        setSearchFavoriteResults(allFavorites)
        return
      }
      if (dashboardSection === 'dashboardSectionLinks') {
        setSearchLinksResults(allBookmarks)
        return
      }
      if (dashboardSection === 'dashboardSectionImages') {
        setSearchImagesResults(allImages)
        return
      }
      if (dashboardSection === 'dashboardSectionVideos') {
        setSearchVideosResults(allVideos)
        return
      }
      if (dashboardSection === 'dashboardSectionArticles') {
        setSearchArticlesResults(allArticles)
        return
      }
    }

    if (dashboardSection === 'dashboardSectionArticles') {
      if (existingDashboardArticleDetail?.isHome) {
        const filteredArticlesResult =
          Array.isArray(allArticles) &&
          allArticles.filter((article) =>
            article.articleFolderName
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()),
          )
        setSearchArticlesResults(filteredArticlesResult)
      }

      if (!existingDashboardArticleDetail?.isHome) {
        const articleUrl = existingDashboardArticleDetail?.articleUrl
        const parsedArticleUrl = articleUrl ? JSON.parse(articleUrl) : []
        const filteredExistingArticlesResult =
          Array.isArray(parsedArticleUrl) &&
          parsedArticleUrl.filter((article) =>
            article.name?.toLowerCase().includes(searchTerm.toLowerCase()),
          )
        const data = {
          ...existingDashboardArticleDetail,
          articleUrl: JSON.stringify(filteredExistingArticlesResult),
        }
        setSearchArticlesResults(data)
      }
    }

    if (dashboardSection === 'dashboardSectionVideos') {
      if (existingDashboardVideoDetail?.isHome) {
        const filteredVideosResult =
          Array.isArray(allVideos) &&
          allVideos.filter((video) =>
            video.videoFolderName
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()),
          )
        setSearchVideosResults(filteredVideosResult)
      }

      if (!existingDashboardVideoDetail?.isHome) {
        const videoUrl = existingDashboardVideoDetail?.videoUrl
        const parsedVideoUrl = videoUrl ? JSON.parse(videoUrl) : []
        const filteredExistingVideosResult =
          Array.isArray(parsedVideoUrl) &&
          parsedVideoUrl.filter((video) =>
            video.name?.toLowerCase().includes(searchTerm.toLowerCase()),
          )
        const data = {
          ...existingDashboardVideoDetail,
          videoUrl: JSON.stringify(filteredExistingVideosResult),
        }
        setSearchVideosResults(data)
      }
    }

    if (dashboardSection === 'dashboardSectionImages') {
      if (existingDashboardImageDetail?.isHome) {
        const filteredImagesResult =
          Array.isArray(allImages) &&
          allImages.filter((image) =>
            image.imageFolderName
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()),
          )
        setSearchImagesResults(filteredImagesResult)
      }

      if (!existingDashboardImageDetail?.isHome) {
        const imageUrl = existingDashboardImageDetail?.imageUrl
        const parsedImageUrl = imageUrl ? JSON.parse(imageUrl) : []
        const filteredExistingImagesResult =
          Array.isArray(parsedImageUrl) &&
          parsedImageUrl.filter((image) =>
            image.name?.toLowerCase().includes(searchTerm.toLowerCase()),
          )
        const data = {
          ...existingDashboardImageDetail,
          imageUrl: JSON.stringify(filteredExistingImagesResult),
        }
        setSearchImagesResults(data)
      }
    }

    if (dashboardSection === 'dashboardSectionLinks') {
      const filteredLinksResult =
        Array.isArray(allBookmarks) &&
        allBookmarks.filter((bookmark) =>
          bookmark.title?.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      setSearchLinksResults(filteredLinksResult)
    }

    if (dashboardSection === 'dashboardSectionFavorites') {
      const filteredFavoritesResults =
        Array.isArray(allFavorites) &&
        allFavorites.filter((favorite) =>
          favorite.title?.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      setSearchFavoriteResults(filteredFavoritesResults)
    }

    if (dashboardSection === 'dashboardSectionCollections') {
      const filteredFolders =
        Array.isArray(allFolders) &&
        allFolders.filter((folder) => folder.parentFolder === parentFolderName)

      const filteredBookmarks =
        Array.isArray(allBookmarks) &&
        allBookmarks.filter(
          (bookmark) => bookmark.folderName === bookmarkFolderName,
        )

      const filteredFolderResults =
        Array.isArray(filteredFolders) &&
        filteredFolders.filter((folder) =>
          folder.name?.toLowerCase().includes(searchTerm.toLowerCase()),
        )

      const filteredBookmarkResults =
        Array.isArray(filteredBookmarks) &&
        filteredBookmarks.filter((bookmark) =>
          bookmark.title?.toLowerCase().includes(searchTerm.toLowerCase()),
        )

      setSearchCollectionFolderResults(filteredFolderResults)
      setSearchCollectionBookmarkResults(filteredBookmarkResults)
    }
  }

  useEffect(() => {
    fetchResults(debouncedQuery)
  }, [debouncedQuery])

  return (
    <div className="dashboardHeaderIconInput">
      <img
        src="images/popup/dashboardSearchIcon.svg"
        alt="icon"
        className="dashboardHeaderIconInputImg"
      />
      <input
        type="text"
        className="dashboardHeaderIconInputArea"
        placeholder="Search by keyword"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </div>
  )
}
