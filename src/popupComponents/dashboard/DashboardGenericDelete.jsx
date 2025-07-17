import React, { useEffect, useState } from 'react'
import '../dashboard/DashboardSection.css'
import { useNotification } from '../notification/NotificationContext'
import { useAuth } from '../../utils/AuthContext'
import {
  delete_all_images_In_Folder,
  delete_selected_image,
} from '../../api/images'
import {
  delete_all_articles_In_Folder,
  delete_selected_article,
} from '../../api/articles'
import {
  delete_all_videos_In_Folder,
  delete_selected_video,
} from '../../api/videos'

export default function DashboardGenericDelete({
  dashboardGenericDelete,
  handleCloseGenericDeleteModal,
}) {
  const [notification, setNotification] = useState({ message: '', type: '' })
  const { createNotification } = useNotification()
  const [loading, setLoading] = useState(false)
  const { fetchDetailsAssociatedWithBookmarks } = useAuth()

  useEffect(() => {
    const showNotification = (message, type) => {
      createNotification({
        message: message,
        duration: 5000,
        background: type === 'success' ? 'green' : 'red',
        color: '#fff',
      })
    }
    if (notification.message) {
      showNotification(notification.message, notification.type)
      if (notification.type === 'success') {
        handleCloseGenericDeleteModal()
      }
    }
  }, [notification])

  const handleDelete = async () => {
    setLoading(true)
    const response = dashboardGenericDelete.isImageFolder
      ? await delete_all_images_In_Folder(
          dashboardGenericDelete.id,
          dashboardGenericDelete.name,
        )
      : dashboardGenericDelete.isImage
      ? await delete_selected_image(
          dashboardGenericDelete.id,
          dashboardGenericDelete.name,
        )
      : dashboardGenericDelete.isArticleFolder
      ? await delete_all_articles_In_Folder(
          dashboardGenericDelete.id,
          dashboardGenericDelete.name,
        )
      : dashboardGenericDelete.isArticle
      ? await delete_selected_article(
          dashboardGenericDelete.id,
          dashboardGenericDelete.name,
        )
      : dashboardGenericDelete.isVideoFolder
      ? await delete_all_videos_In_Folder(
          dashboardGenericDelete.id,
          dashboardGenericDelete.name,
        )
      : dashboardGenericDelete.isVideo
      ? await delete_selected_video(
          dashboardGenericDelete.id,
          dashboardGenericDelete.name,
        )
      : () => {}
    setLoading(false)
    if (response.success) {
      setNotification({ message: response.message, type: 'success' })
      await fetchDetailsAssociatedWithBookmarks()
    } else {
      console.error(response.message)
      setNotification({ message: response.message, type: 'error' })
    }
  }

  return (
    <div className="dashboardSectionDeleteModal">
      <div className="dashboardSectionDeleteModalContainer">
        <h2 className="dashboardSectionDeleteModalHeader">Delete</h2>
        <div className="dashboardSectionDeleteModalInfo">
          {dashboardGenericDelete.isFolder ? (
            <>
              Are you sure you want to delete{' '}
              {`"${dashboardGenericDelete?.name}"`} folder and its content?
            </>
          ) : (
            <>
              Are you sure you want to delete{' '}
              {`"${dashboardGenericDelete?.name}"`}{' '}
              {dashboardGenericDelete.isImage
                ? 'image?'
                : dashboardGenericDelete.isArticle
                ? 'article?'
                : dashboardGenericDelete.isVideo
                ? 'video?'
                : ''}
            </>
          )}
        </div>
        <div className="dashboardSectionDeleteModalNameBtnAction">
          <button
            className="dashboardSectionDeleteModalNameBtnCreate"
            onClick={handleDelete}
          >
            {loading ? 'Deleting' : 'Delete'}
          </button>
          <button
            className="dashboardSectionDeleteModalNameBtnCancel"
            onClick={handleCloseGenericDeleteModal}
          >
            Cancel
          </button>
        </div>
        <div className="dashboardSectionDeleteModalAlert">
          <img
            src="images/popup/alert-circle.svg"
            className="dashboardSectionDeleteModalAlertImg"
            alt="alert"
          />
          This can’t be undone
        </div>
      </div>
    </div>
  )
}
