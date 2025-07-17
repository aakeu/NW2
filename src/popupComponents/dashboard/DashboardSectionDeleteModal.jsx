import React, { useEffect, useState } from 'react'
import '../dashboard/DashboardSection.css'
import { useNotification } from '../notification/NotificationContext'
import { useAuth } from '../../utils/AuthContext'
import { delete_folder } from '../../api/folder'
import { delete_bookmark, delete_favorite } from '../../api/bookmark'
import { backToDashboardSectionCollections } from '../../utils/sectionManagement'

export default function DashboardSectionDeleteModal({
  handleCloseDeleteModal,
  deleteDetails,
}) {
  const [notification, setNotification] = useState({ message: '', type: '' })
  const { createNotification } = useNotification()
  const [loading, setLoading] = useState(false)
  const { fetchAllFolders, fetchDetailsAssociatedWithBookmarks } = useAuth()

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
        handleCloseDeleteModal()
      }
    }
  }, [notification])

  const handleDelete = async () => {
    setLoading(true)
    const response = deleteDetails.isFolder
      ? await delete_folder(deleteDetails.id)
      : deleteDetails.isBookmark
      ? await delete_bookmark(deleteDetails.id)
      : deleteDetails.isFavorite
      ? await delete_favorite(deleteDetails.id)
      : () => {}
    setLoading(false)
    if (response.success) {
      setNotification({ message: response.message, type: 'success' })
      await fetchAllFolders()
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
          {deleteDetails.isFolder ? (
            <>
              Are you sure you want to delete {`"${deleteDetails.name}"`} folder
              and its content?
            </>
          ) : (
            <>
              Are you sure you want to delete {`"${deleteDetails.name}"`}{' '}
              bookmark?
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
            onClick={handleCloseDeleteModal}
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
