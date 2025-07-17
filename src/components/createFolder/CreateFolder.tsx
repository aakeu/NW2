import React, { useEffect, useState } from 'react'
import * as Yup from 'yup'
import { Formik, Form, ErrorMessage, Field, FormikHelpers } from 'formik'
import '../createFolder/CreateFolder.css'
import { useNotification } from '../notification/NotificationContext'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../state'
import {
  setCreateNormalFolder,
  setSelectedParentFolderName,
  setShowFolderModal,
} from '../../state/slice/reusableStatesSlice'
import { getChromeStorage } from '../reusables/Reusables'
import { Folder } from '../../state/types/folder'
import {
  clearSuccessMessage,
  createFolder,
  fetchAllFolders,
  initializeChildFolders,
  initializeCollectionAncestorFolders,
  initializeFolders,
  setCollectionAncestorFolders,
  setCollectionFolders,
} from '../../state/slice/folderSlice'
import { bookmarkFoldersUpdate, getChildBookmarks, getChildFolders, getParentFolders } from '../../utils/siderUtility/siderUtility'
import { fetchAllBookmarks, initializeBookmarkParentName, initializeBookmarks, initializeChildBookmarks, setBookmarkParentName, setCollectionBookmarks } from '../../state/slice/bookmarkSlice'

type CreateFolderValues = {
  folderName: string
  parentFolderName?: string
}

const CreateFolder: React.FC = () => {
  const [notification, setNotification] = useState({ message: '', type: '' })
  const { createNotification } = useNotification()
  const { createNormalFolder, selectedParentFolderName } = useSelector(
    (state: RootState) => state.reusable,
  )
  const { folders, successMessage, error } = useSelector(
    (state: RootState) => state.folders,
  )
  const { bookmarks } = useSelector(
    (state: RootState) => state.bookmarks,
  )
  const { isDarkMode } = useSelector((state: RootState) => state.theme)
  const section = useSelector((state: RootState) => state.sections.activeSection)
  const dispatch = useDispatch<AppDispatch>()
  const {collectionAncestorFolders } = useSelector(
    (state: RootState) => state.folders)


  const toggleNormalAndSubfolder = () => {
    dispatch(setCreateNormalFolder(!createNormalFolder))
  }

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
        dispatch(setShowFolderModal(false))
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

  const collectionValidator = Yup.object({
    folderName: Yup.string().required('This field is required'),
  })

  const normalFolderInitialValues = {
    folderName: '',
  }

  const subFolderInitialValues = {
    parentFolderName: '',
    folderName: '',
  }

  const collectionInitialValues = {
    folderName: '',
  }


  const handleCreateFolderSubmit = async (
    values: CreateFolderValues,
    { setSubmitting }: FormikHelpers<CreateFolderValues>,
  ) => {
    const folders: Folder[] = (await getChromeStorage('allFolders')) as Folder[]
    const folderNameExists = folders.some(
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

    let createFolderData: { name: string; parentFolder: string } = {
      name: values.folderName,
      parentFolder: section === "dashboardCollectionSection" ?
          collectionAncestorFolders.length > 0 ?
          collectionAncestorFolders[collectionAncestorFolders.length - 1] 
          : "/"
        : createNormalFolder ? '/' : values.parentFolderName || '/'
    }

    console.log({
      createFolderData
    })

    try {
      await dispatch(createFolder(createFolderData)).unwrap()
      await dispatch(fetchAllFolders())
      await dispatch(fetchAllBookmarks())                

      const theFolder = collectionAncestorFolders[collectionAncestorFolders.length - 1] 

      const ancestorFolders = await getParentFolders(theFolder, folders)
      const childFolders = await getChildFolders(theFolder, folders)
      const childBookmarks = await getChildBookmarks(theFolder, bookmarks)

      await Promise.all([
        dispatch(setBookmarkParentName(theFolder)),
        dispatch(setCollectionFolders(childFolders)),
        dispatch(setCollectionAncestorFolders(ancestorFolders)),
        dispatch(setCollectionBookmarks(childBookmarks)),
        dispatch(initializeBookmarks()),
        dispatch(initializeBookmarkParentName()),
        dispatch(initializeChildBookmarks()),
        dispatch(initializeFolders()),
        dispatch(initializeChildFolders()),
        dispatch(initializeCollectionAncestorFolders())
      ])
      bookmarkFoldersUpdate()
      setNotification({
        message: 'Folder created successfully',
        type: 'success',
      })
    } catch (err) {
      console.error('Create folder error:', err)
      setNotification({
        message:
          err instanceof Error
            ? err.message
            : 'Failed to create folder. Please try again',
        type: 'error',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleParentFolderChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    dispatch(setSelectedParentFolderName(event.target.value))
  }

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearSuccessMessage())
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage, dispatch])

  useEffect(() => {
    dispatch(fetchAllFolders())
  }, [dispatch])

  useEffect(() => {
    dispatch(initializeFolders())
  }, [dispatch])

  return (
    <>
      <div
        className={isDarkMode ? 'createFolderModalDark' : 'createFolderModal'}
      >
        <div className="createFolderModalContainer">
          <img
            src="images/close.svg"
            alt="close"
            className="createFolderModalClose"
            onClick={() => {
              dispatch(setShowFolderModal(false))
            }}
          />
          <h3
            className={
              isDarkMode ? 'createFolderHeaderDark' : 'createFolderHeader'
            }
          >
            {section === "dashboardCollectionSection" ? "Create new folder" : "Create a folder"}
          </h3>
          {section !== "dashboardCollectionSection" && (
            <h4
              className={
                isDarkMode
                  ? 'createFolderWantSubfolderDark'
                  : 'createFolderWantSubfolder'
              }
              onClick={toggleNormalAndSubfolder}
            >
              {createNormalFolder
                ? 'Want to create subfolder?'
                : 'Want to create normal folder?'}
            </h4>
          )}
          <Formik<CreateFolderValues>
            initialValues={section === "dashboardCollectionSection" ?
                collectionInitialValues :
              createNormalFolder
                ? normalFolderInitialValues
                : subFolderInitialValues
            }
            validationSchema={section === "dashboardCollectionSection" ?
                collectionValidator :
              createNormalFolder ? normalFolderValidator : subFolderValidator
            }
            onSubmit={handleCreateFolderSubmit}
            enableReinitialize
          >
            {({ isSubmitting, isValid, dirty }) => (
              <Form>
                {section !== "dashboardCollectionSection" && (
                  !createNormalFolder && (
                    <div className="createFolderParentFolderNameErrorHolder">
                      <Field name="parentFolderName">
                        {({
                          field,
                          form,
                          meta,
                        }: {
                          field: any
                          form: any
                          meta: any
                        }) => (
                          <div>
                            <select
                              {...field}
                              value={selectedParentFolderName || ''}
                              className={`${
                                isDarkMode
                                  ? 'createFolderParentFolderSelectDark'
                                  : 'createFolderParentFolderSelect'
                              }  ${
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
                              {folders.map((folder) => (
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
                        className={
                          isDarkMode
                            ? 'createFolderParentFolderErrorDark'
                            : 'createFolderParentFolderError'
                        }
                      />
                    </div>
                  )
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
                    {({
                      field,
                      _,
                      meta,
                    }: {
                      field: any
                      _: any
                      meta: { error?: string; touched?: boolean }
                    }) => (
                      <div className="createFolderNameHolder">
                        {section !== "dashboardCollectionSection" && (
                          <>
                            <span className="createFolderNameText">
                              FOLDER NAME
                            </span>
                            <input
                              type="text"
                              placeholder="Enter folder name"
                              className={`${
                                isDarkMode
                                  ? 'createFolderNameInputDark'
                                  : 'createFolderNameInput'
                              } ${
                                meta.error && meta.touched
                                  ? 'createFolderNameInputExtra'
                                  : ''
                              }`}
                              name="folderName"
                              {...field}
                            />
                          </>
                        )}
                        {section === "dashboardCollectionSection" && (
                          <>
                            <div className='createFolderNameHolderCollectionAncestor'>
                              <span className="createFolderNameText">
                                Current Folder:
                              </span>
                              <span className={isDarkMode ? 'createFolderNameTextAncestorDark' 
                                  : "createFolderNameTextAncestor"}>
                                {collectionAncestorFolders.length > 0 && 
                                  collectionAncestorFolders[collectionAncestorFolders.length - 1] === "/" ? 
                                  "Home" : collectionAncestorFolders[collectionAncestorFolders.length - 1]}
                              </span>
                            </div>
                            <input
                                type="text"
                                placeholder="Enter folder name"
                                className={`${
                                  isDarkMode
                                    ? 'createFolderNameInputDark'
                                    : 'createFolderNameInput'
                                } ${
                                  meta.error && meta.touched
                                    ? 'createFolderNameInputExtra'
                                    : ''
                                }`}
                                name="folderName"
                                {...field}
                              />
                          </>
                        )}                       
                      </div>
                    )}
                  </Field>
                  <ErrorMessage
                    name="folderName"
                    component="div"
                    className={
                      isDarkMode
                        ? 'createFolderNameErrorDark'
                        : 'createFolderNameError'
                    }
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

export default CreateFolder
