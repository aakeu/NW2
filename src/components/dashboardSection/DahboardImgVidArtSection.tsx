import React, { useState } from "react";
import '../dashboardSection/DashboardSection.css'
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../state";
import { setFilteredMedia, setFilteredMediaId, setFilteredMediaTitle, setIsFilteredMedia } from "../../state/slice/reusableStatesSlice";

interface DashboardImgVidArtProps {
    id: number
    title: string
}

const DashboardImgVidArtSection: React.FC<DashboardImgVidArtProps> = ({ id, title }) => {
    const { activeSection } = useSelector((state: RootState) => state.sections)
    const images = useSelector((state: RootState) => state.images)
    const videos = useSelector((state: RootState) => state.videos)
    const articles = useSelector((state: RootState) => state.articles)
    const cardList = useSelector((state: RootState) => state.cardLIst)
    const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode)
    const dispatch = useDispatch<AppDispatch>()

    const filteredImages = Array.isArray(images.images) && images.images.length > 0
        ? images.images.filter(image => image.imageFolderName === title)
        : [];
    
    const totalImageCount = filteredImages.reduce((count, image) => {
        try {
            const imageArray = JSON.parse(image.imageUrl);
            return count + (Array.isArray(imageArray) ? imageArray.length : 0);
        } catch (error) {
            console.error("Error parsing imageUrl:", error);
            return count;
        }
    }, 0);
    const filteredVideos = Array.isArray(videos.videos) && videos.videos.length > 0
        ? videos.videos.filter(video => video.videoFolderName === title)
        : [];
    
    const totalVideoCount = filteredVideos.reduce((count, video) => {
        try {
            const videoArray = JSON.parse(video.videoUrl);
            return count + (Array.isArray(videoArray) ? videoArray.length : 0);
        } catch (error) {
            console.error("Error parsing videoUrl:", error);
            return count;
        }
    }, 0);
    const filteredArticles = Array.isArray(articles.articles) && articles.articles.length > 0
        ? articles.articles.filter(article => article.articleFolderName === title)
        : [];
    
    const totalArticleCount = filteredArticles.reduce((count, article) => {
        try {
            const articleArray = JSON.parse(article.articleUrl);
            return count + (Array.isArray(articleArray) ? articleArray.length : 0);
        } catch (error) {
            console.error("Error parsing articleUrl:", error);
            return count;
        }
    }, 0);

    const handleFilteredImages = async () => {
        dispatch(setFilteredMediaId(id && id))
        dispatch(setIsFilteredMedia(true))
        dispatch(setFilteredMedia(JSON.parse(filteredImages[0].imageUrl)))
        dispatch(setFilteredMediaTitle(title))
    }
    const handleFilteredVideos = async () => {
        dispatch(setFilteredMediaId(id && id))
        dispatch(setIsFilteredMedia(true))
        dispatch(setFilteredMedia(JSON.parse(filteredVideos[0].videoUrl)))
        dispatch(setFilteredMediaTitle(title))
    }
    const handleFilteredArticles = async () => {
        dispatch(setFilteredMediaId(id && id))
        dispatch(setIsFilteredMedia(true))
        dispatch(setFilteredMedia(JSON.parse(filteredArticles[0].articleUrl)))
        dispatch(setFilteredMediaTitle(title))
    }

    return (
        <div className={cardList.activeCardList === "isCard" 
                ? 
                    isDarkMode ? "dashboardCardFolderDark" : "dashboardCardFolder"
                :   isDarkMode ? "DashboardListFolderDark" : "DashboardListFolder"}
            >
                {cardList.activeCardList === "isCard" && (
                    <div className='dashboardCardFolderContent'>
                        <div className='dashboardCardFolderContentDetails' 
                                onClick={activeSection === "dashboardImagesSection" ? () => handleFilteredImages()
                                    : activeSection === "dashboardVideosSection" ? () => handleFilteredVideos()
                                    : activeSection === "dashboardArticlesSection" ? () => handleFilteredArticles()
                                    : () => {}
                                }
                            >
                                <img src='images/popup/folder.svg' alt='folder' className='dashboardCardFolderImg' />
                                <span style={{
                                    textAlign: "center"
                                }} className={isDarkMode ? 'dashboardCardFolderContentDetailsTitleDark'
                                    : "dashboardCardFolderContentDetailsTitle"}>{title}</span>
                                {activeSection === "dashboardImagesSection" && (
                                    <span className='dashboardCardFolderContentDetailsCount'>
                                        {`${totalImageCount} images`}
                                    </span>
                                )}
                                {activeSection === "dashboardVideosSection" && (
                                    <span className='dashboardCardFolderContentDetailsCount'>
                                        {`${totalVideoCount} videos`}
                                    </span>
                                )}
                                {activeSection === "dashboardArticlesSection" && (
                                    <span className='dashboardCardFolderContentDetailsCount'>
                                        {`${totalArticleCount} articles`}
                                    </span>
                                )}
                        </div>
                    </div>
                )}
                {cardList.activeCardList === "isList" && (
                    <div className='DashboardListFolderContent'
                        onClick={activeSection === "dashboardImagesSection" ? () => handleFilteredImages()
                            : activeSection === "dashboardVideosSection" ? () => handleFilteredVideos()
                            : activeSection === "dashboardArticlesSection" ? () => handleFilteredArticles()
                            : () => {}
                        }
                >
                    <img src='images/popup/folder.svg' alt='folder' className='DashboardListFolderImg' />
                    <div className='DashboardListFolderContentDetails'>
                        <span className={isDarkMode ? 'DashboardListFolderContentDetailsTitleDark'
                            : 'DashboardListFolderContentDetailsTitle'}>{title}</span>
                        {activeSection === "dashboardImagesSection" && (
                            <span className='DashboardListFolderContentDetailsCount'>
                                {`${totalImageCount} images`}
                            </span>
                        )}
                        {activeSection === "dashboardVideosSection" && (
                            <span className='DashboardListFolderContentDetailsCount'>
                                {`${totalVideoCount} videos`}
                            </span>
                        )}
                        {activeSection === "dashboardArticlesSection" && (
                            <span className='DashboardListFolderContentDetailsCount'>
                                {`${totalArticleCount} articles`}
                            </span>
                        )}
                    </div>
                </div>
                )}
        </div>
    )
}

export default DashboardImgVidArtSection