import React, { useEffect, useState } from "react";
import '../deleteModal/DeleteModal.css'
import { AppDispatch, RootState } from "../../state";
import { useDispatch, useSelector } from "react-redux";
import { initializeFilteredMedia, setFilteredMedia, setShowMediaDeleteModal } from "../../state/slice/reusableStatesSlice";
import { useNotification } from "../notification/NotificationContext";
import { deleteSelectedImage, fetchAllImages, initializeImages } from "../../state/slice/imageSlice";
import { deleteSelectedVideo, fetchAllVideos, initializeVideos } from "../../state/slice/videoSlice";
import { deleteSelectedArticle, fetchAllArticles, initializeArticles } from "../../state/slice/articleSlice";

const MediaDeleteModal: React.FC = () => {
    const [notification, setNotification] = useState({ message: '', type: '' })
    const { createNotification } = useNotification()
    const [deleting, setDeleting] = useState(false)
    const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
    const { itemNameToDelete, filteredMediaId, filteredMediaTitle } 
            = useSelector((state: RootState) => state.reusable)
    const { activeSection } = useSelector((state: RootState) => state.sections)
    const images = useSelector((state: RootState) => state.images)
    const videos = useSelector((state: RootState) => state.videos)
    const articles = useSelector((state: RootState) => state.articles)
    const dispatch = useDispatch<AppDispatch>()

    const filteredImages = Array.isArray(images.images) && images.images.length > 0
        ? images.images.filter(image => image.imageFolderName === filteredMediaTitle)
        : [];
    const filteredVideos = Array.isArray(videos.videos) && videos.videos.length > 0
            ? videos.videos.filter(video => video.videoFolderName === filteredMediaTitle)
            : [];
    const filteredArticles = Array.isArray(articles.articles) && articles.articles.length > 0
            ? articles.articles.filter(article => article.articleFolderName === filteredMediaTitle)
            : [];

    console.log({
        itemNameToDelete,
        filteredMediaId,
        filteredMediaTitle
    })

    useEffect(() => {
        const showNotification = (message: string | null, type: string) => {
            createNotification({
            message: message || '',
            duration: 5000,
            background: type === 'success' ? 'green' : 'red',
            color: '#fff',
            })
        }
        if (notification.message) {
            showNotification(notification.message, notification.type)
            if (notification.type === 'success') {
                dispatch(setShowMediaDeleteModal(false))
            }
        }
    }, [notification])

    const handleDelete = async () => {
        try {
            setDeleting(true);
            if (!filteredMediaId) {
                throw new Error('Media ID is missing');
            }
    
            let mediaUrl: string | null = null;
            if (activeSection === "dashboardImagesSection") {
                if (!filteredImages.length) {
                    throw new Error('No images found for the selected filter');
                }
                mediaUrl = filteredImages[0].imageUrl;
                await Promise.all([
                    dispatch(deleteSelectedImage({ id: filteredMediaId, selectedImgName: itemNameToDelete || '' })).unwrap(),
                    dispatch(fetchAllImages()),
                    dispatch(setFilteredMedia(JSON.parse(mediaUrl))),
                    dispatch(initializeFilteredMedia()),
                ]);
            } else if (activeSection === "dashboardVideosSection") {
                if (!filteredVideos.length) {
                    throw new Error('No videos found for the selected filter');
                }
                mediaUrl = filteredVideos[0].videoUrl;
                await Promise.all([
                    dispatch(deleteSelectedVideo({ id: filteredMediaId, selectedVideoName: itemNameToDelete || '' })).unwrap(),
                    dispatch(fetchAllVideos()),
                    dispatch(setFilteredMedia(JSON.parse(mediaUrl))),
                    dispatch(initializeFilteredMedia()),
                ]);
            } else if (activeSection === "dashboardArticlesSection") {
                if (!filteredArticles.length) {
                    throw new Error('No articles found for the selected filter');
                }
                mediaUrl = filteredArticles[0].articleUrl;
                await Promise.all([
                    dispatch(deleteSelectedArticle({ id: filteredMediaId, selectedArticleName: itemNameToDelete || '' })).unwrap(),
                    dispatch(fetchAllArticles()),
                    dispatch(setFilteredMedia(JSON.parse(mediaUrl))),
                    dispatch(initializeFilteredMedia()),
                ]);
            } else {
                throw new Error('Invalid section selected');
            }
    
            setNotification({
                message:
                    activeSection === "dashboardImagesSection"
                        ? 'Image deleted successfully'
                        : activeSection === "dashboardVideosSection"
                        ? 'Video deleted successfully'
                        : 'Article deleted successfully',
                type: 'success',
            });
        } catch (err) {
            setNotification({
                message:
                    err instanceof Error
                        ? err.message
                        : activeSection === "dashboardImagesSection"
                        ? 'Failed to delete image. Please try again'
                        : activeSection === "dashboardVideosSection"
                        ? 'Failed to delete video. Please try again'
                        : activeSection === "dashboardArticlesSection"
                        ? 'Failed to delete article. Please try again'
                        : 'Failed to delete media. Please try again',
                type: 'error',
            });
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className={isDarkMode ? "deleteModalDark" : "deleteModal"}>
            <div className="deleteModalContent">
                <img
                    src="images/close.svg"
                    alt="close"
                    className="deleteModalClose"
                    onClick={() => {
                        dispatch(setShowMediaDeleteModal(false))
                    }}
                />
                <h3
                    className={
                        isDarkMode ? 'deleteModalHeaderDark' : 'deleteModalHeader'
                    }
                >
                    Delete
                </h3>
                <span className="deleteModalContentInfo">
                    Are you sure you want to delete?
                </span>
                <span className={isDarkMode ? "deleteModalContentTextDark" : "deleteModalContentText"}>
                    {itemNameToDelete}
                </span>
                <div className="deleteModalContentButtons">
                    <button
                        className={isDarkMode ? "deleteModalDeleteButtonDark" : "deleteModalDeleteButton"}
                        onClick={handleDelete}
                    >
                        {deleting ? "Deleting..." : "Delete"}
                    </button>
                    <button
                        className={isDarkMode ? "deleteModalCancelButtonDark" : "deleteModalCancelButton"}
                        onClick={() => {
                            dispatch(setShowMediaDeleteModal(false))
                        }}
                    >
                        Cancel
                    </button>
                </div>
                <div className="deleteModalWarning">
                    <img
                        src={isDarkMode ? "images/warningDark.svg" : "images/warning.svg"}
                        alt="warning"
                        className="deleteModalWarningIcon"
                    />
                    <span className={isDarkMode ? "deleteModalWarningTextDark" : "deleteModalWarningText"}>
                        This can’t be undone
                    </span>
                </div>
            </div>
        </div>
    )
}

export default MediaDeleteModal