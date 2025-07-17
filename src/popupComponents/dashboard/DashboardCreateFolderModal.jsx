import React, { useEffect, useState } from 'react'
import * as Yup from 'yup'
import { Formik, Form, ErrorMessage, Field } from 'formik'
import '../dashboard/DashboardSection.css'
import { useNotification } from '../notification/NotificationContext'
import { useAuth } from '../../utils/AuthContext'
import { create_folder } from '../../api/folder'
import {
  handleFolderClick,
} from '../../utils/dashboardUtility'

export default function DashboardCreateFolderModal({
  handleCloseCreateFolderModal,
  collectionFolderAncestors,
  allFolders,
  allBookmarks,
}) {
  const [notification, setNotification] = useState({ message: '', type: '' })
  const { createNotification } = useNotification()
  const { fetchAllFolders } = useAuth()

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
        handleCloseCreateFolderModal()
      }
    }
  }, [notification])

  const folderNameValidator = Yup.object({
    folderName: Yup.string().required('This field is required'),
  })
  const folderNameInitialValues = {
    folderName: '',
  }

  const handleCreateFolderSubmit = async (values, { setSubmitting }) => {
    const parentFolderName =
      Array.isArray(collectionFolderAncestors) &&
      collectionFolderAncestors.length > 0 &&
      collectionFolderAncestors[collectionFolderAncestors.length - 1]

    const folderNameExists = await allFolders.some(
      (folder) => folder.name === values.folderName,
    )
    if (folderNameExists) {
      setNotification({
        message: `Folder with name ${values.folderName} already exists`,
        type: 'error',
      })
      setSubmitting(false)
      return
    }
    const response = await create_folder(values.folderName, parentFolderName)
    setSubmitting(false)
    if (response.success) {
      await fetchAllFolders()
      setNotification({ message: response.message, type: 'success' })
      await handleFolderClick(parentFolderName, allFolders, allBookmarks)
    } else {
      console.error(response.message)
      setNotification({ message: response.message, type: 'error' })
    }
  }
  return (
    <div className="dashboardCreateFolderModal">
      <div className="dashboardCreateFolderModalDetails">
        <img
          src="images/popup/close.svg"
          alt="close"
          className="dashboardCreateFolderModalClose"
          onClick={handleCloseCreateFolderModal}
        />
        <h2 className="dashboardCreateFolderHeader">Create New Folder</h2>
        <Formik
          initialValues={folderNameInitialValues}
          validationSchema={folderNameValidator}
          onSubmit={handleCreateFolderSubmit}
          enableReinitialize
        >
          {({ isSubmitting, isValid, dirty }) => (
            <Form>
              <div className="dashboardCreateFolderModalInfoHolder">
                <span className="dashboardCreateFolderModalInfoCurrent">
                  Current Folder:
                </span>
                <span className="dashboardCreateFolderModalInfoCurrentName">
                  {Array.isArray(collectionFolderAncestors) &&
                  collectionFolderAncestors.length > 0 &&
                  collectionFolderAncestors[
                    collectionFolderAncestors.length - 1
                  ] === '/'
                    ? 'Home'
                    : collectionFolderAncestors[
                        collectionFolderAncestors.length - 1
                      ]}
                </span>
              </div>
              <div className="dashboardCreateFolderInputErrorHolder">
                <Field name="folderName">
                  {({ field, _, meta }) => (
                    <input
                      type="text"
                      placeholder="Input folder name..."
                      className={`dashboardCreateFolderInput ${
                        meta.error && meta.touched
                          ? 'dashboardCreateFolderInputExtra'
                          : ''
                      }`}
                      name="folderName"
                      {...field}
                    />
                  )}
                </Field>
                <ErrorMessage
                  name="folderName"
                  component="div"
                  className="dashboardCreateFolderInputError"
                />
              </div>
              <div className="dashboardCreateFolderModalBtnAction">
                <button
                  type="submit"
                  disabled={!dirty || !isValid || isSubmitting}
                  className={`${
                    !dirty || !isValid || isSubmitting
                      ? 'dashboardCreateFolderModalBtnCreateExtra'
                      : 'dashboardCreateFolderModalBtnCreate'
                  }`}
                >
                  {isSubmitting ? 'Submitting...' : 'Create'}
                </button>
                <button
                  type="button"
                  className="dashboardCreateFolderModalBtnCancel"
                  onClick={handleCloseCreateFolderModal}
                >
                  Cancel
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  )
}
