import React, { useEffect, useState } from 'react'
import '../dashboard/DashboardSection.css'
import * as Yup from 'yup'
import { Formik, Form, ErrorMessage, Field } from 'formik'
import { useNotification } from '../notification/NotificationContext'
import { useAuth } from '../../utils/AuthContext'
import { update_folder } from '../../api/folder'

export default function DashboardRenameModal({
  handleCloseRenameModal,
  folderIdToRename,
  collectionFolderAncestors,
  allFolders
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
        handleCloseRenameModal()
      }
    }
  }, [notification])

  const nameValidator = Yup.object({
    name: Yup.string().required('This field is required'),
  })
  const nameInitialValues = {
    name: '',
  }

  const handleUpdateFolderSubmit = async (values, { setSubmitting }) => {
    const parentFolderName =
      Array.isArray(collectionFolderAncestors) &&
      collectionFolderAncestors.length > 0 &&
      collectionFolderAncestors[collectionFolderAncestors.length - 1]
    console.log(parentFolderName)

    const folderNameExists = await allFolders.some(
      (folder) => folder.name === values.name,
    )
    if (folderNameExists) {
      setNotification({
        message: `Folder with name ${values.name} already exists`,
        type: 'error',
      })
      setSubmitting(false)
      return
    }
    const response = await update_folder(
      folderIdToRename,
      parentFolderName,
      values.name,
    )
    setSubmitting(false)
    if (response.success) {
      await fetchAllFolders()
      setNotification({ message: response.message, type: 'success' })
    } else {
      console.error(response.message)
      setNotification({ message: response.message, type: 'error' })
    }
  }

  return (
    <div className="dashboardRenameModal">
      <div className="dashboardRenameModalDetails">
        <img
          src="images/popup/close.svg"
          alt="close"
          className="dashboardRenameModalClose"
          onClick={handleCloseRenameModal}
        />
        <h2 className="dashboardRenameHeader">Rename</h2>
        <Formik
          initialValues={nameInitialValues}
          validationSchema={nameValidator}
          onSubmit={handleUpdateFolderSubmit}
          enableReinitialize
        >
          {({ isSubmitting, isValid, dirty }) => (
            <Form>
              <div className="dashboardRenameInputErrorHolder">
                <Field name="name">
                  {({ field, _, meta }) => (
                    <input
                      type="text"
                      placeholder="Input folder name..."
                      className={`dashboardRenameInput ${
                        meta.error && meta.touched
                          ? 'dashboardRenameInputExtra'
                          : ''
                      }`}
                      name="name"
                      {...field}
                    />
                  )}
                </Field>
                <ErrorMessage
                  name="name"
                  component="div"
                  className="dashboardRenameInputError"
                />
              </div>
              <div className="dashboardRenameModalBtnAction">
                <button
                  type="submit"
                  disabled={!dirty || !isValid || isSubmitting}
                  className={`${
                    !dirty || !isValid || isSubmitting
                      ? 'dashboardRenameModalBtnRenameExtra'
                      : 'dashboardRenameModalBtnRename'
                  }`}
                >
                  {isSubmitting ? 'Submitting...' : 'Rename'}
                </button>
                <button
                  type="button"
                  className="dashboardRenameModalBtnCancel"
                  onClick={handleCloseRenameModal}
                >
                  Cancel
                </button>
                {/* <button type="submit" className="dashboardRenameModalBtnRename">
                  Rename
                </button>
                <button
                  type="button"
                  className="dashboardRenameModalBtnCancel"
                  onClick={handleCloseRenameModal}
                >
                  Cancel
                </button> */}
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  )
}
