import React, { useEffect, useState } from 'react'
import * as Yup from 'yup'
import { Formik, Form, ErrorMessage, Field } from 'formik'
import '../createFolder/CreateFolder.css'
import { useNotification } from '../notification/NotificationContext'
import { create_folder } from '../../api/folder'
import { useAuth } from '../../utils/AuthContext'

export default function CreateFolder({ setShowFolderModal, allFolders }) {
  const [createNormalFolder, setCreateNormalFolder] = useState(true)
  const [notification, setNotification] = useState({ message: '', type: '' })
  const [selectedParentFolderName, setSelectedParentFolderName] = useState(null)
  const { createNotification } = useNotification()
  const { fetchAllFolders } = useAuth()

  const toggleNormalAndSubfolder = () => {
    setCreateNormalFolder((prevState) => !prevState)
  }

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
      if (notification.type === "success") {
        setShowFolderModal(false)
      }
    }
  }, [notification])

  const normalFolderValidator = Yup.object({
    folderName: Yup.string().required('This field is required'),
  })
  const subFolderValidator = Yup.object({
    parentFolderName: Yup.string().required('This field is required'),
    folderName: Yup.string().required('This field is required'),
  })

  const normalFolderInitialValues = {
    folderName: '',
  }

  const subFolderInitialValues = {
    parentFolderName: '',
    folderName: '',
  }

  const handleCreateFolderSubmit = async (values, { setSubmitting }) => {
    console.log('create folder values', values)
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
    let response = null
    if (createNormalFolder) {
      response = await create_folder(values.folderName, '/')
    } else {
      response = await create_folder(values.folderName, values.parentFolderName)
    }
    setSubmitting(false)
    if (response.success) {
      await fetchAllFolders()
      setNotification({ message: response.message, type: 'success' })
    } else {
      console.error(response.message)
      setNotification({ message: response.message, type: 'error' })
    }
  }

  const handleParentFolderChange = (event) => {
    setSelectedParentFolderName(event.target.value)
  }
  return (
    <>
      <div className="createFolderModal">
        <div className="createFolderModalContainer">
          <img
            src="images/popup/close.svg"
            alt="close"
            className="createFolderModalClose"
            onClick={() => {
              setShowFolderModal(false)
            }}
          />
          <h3 className="createFolderHeader">Create a folder</h3>
          <h4
            className="createFolderWantSubfolder"
            onClick={toggleNormalAndSubfolder}
          >
            {createNormalFolder
              ? 'Want to create subfolder?'
              : 'Want to create normal folder?'}
          </h4>
          <Formik
            initialValues={
              createNormalFolder
                ? normalFolderInitialValues
                : subFolderInitialValues
            }
            validationSchema={
              createNormalFolder ? normalFolderValidator : subFolderValidator
            }
            onSubmit={handleCreateFolderSubmit}
            enableReinitialize
          >
            {({ isSubmitting, isValid, dirty }) => (
              <Form>
                {!createNormalFolder && (
                  <div className="createFolderParentFolderNameErrorHolder">
                    <Field name="parentFolderName">
                      {({ field, form, meta }) => (
                        <div>
                          <select
                            {...field}
                            value={selectedParentFolderName || ''}
                            className={`createFolderParentFolderSelect ${
                              meta.error && meta.touched
                                ? 'createFolderParentFolderSelectExtra'
                                : ''
                            }`}
                            onChange={(event) => {
                              handleParentFolderChange(event)
                              form.setFieldValue(
                                'parentFolderName',
                                event.target.value,
                              )
                            }}
                          >
                            <option value="" label="Select Parent folder" />
                            {Array.isArray(allFolders) &&
                              allFolders.map((folder) => (
                                <option
                                  key={folder.id}
                                  value={folder.name}
                                  label={folder.name}
                                />
                              ))}
                          </select>
                        </div>
                      )}
                    </Field>
                    <ErrorMessage
                      name="parentFolderName"
                      component="div"
                      className="createFolderParentFolderError"
                    />
                  </div>
                )}
                <div
                  className="createFolderNameErrorHolder"
                  style={
                    !createNormalFolder
                      ? {
                          marginTop: '7px',
                        }
                      : {}
                  }
                >
                  <Field name="folderName">
                    {({ field, _, meta }) => (
                      <div className="createFolderNameHolder">
                        <span className="createFolderNameText">
                          FOLDER NAME
                        </span>
                        <input
                          type="text"
                          placeholder="Enter folder name"
                          className={`createFolderNameInput ${
                            meta.error && meta.touched
                              ? 'createFolderNameInputExtra'
                              : ''
                          }`}
                          name="folderName"
                          {...field}
                        />
                      </div>
                    )}
                  </Field>
                  <ErrorMessage
                    name="folderName"
                    component="div"
                    className="createFolderNameError"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!dirty || !isValid || isSubmitting}
                  className={`${
                    !dirty || !isValid || isSubmitting
                      ? 'createFolderBtnExtra'
                      : 'createFolderBtn'
                  }`}
                >
                  {isSubmitting ? 'Submitting...' : 'Create'}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </>
  )
}
