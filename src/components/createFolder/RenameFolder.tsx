import React, { useEffect, useState } from 'react'
import '../createFolder/CreateFolder.css'
import * as Yup from 'yup'
import { Formik, Form, ErrorMessage, Field, FormikHelpers } from 'formik'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../state'
import { setShowRenameFolderModal } from '../../state/slice/reusableStatesSlice'
import { useNotification } from '../notification/NotificationContext'
import { Folder } from '../../state/types/folder'
import { getChromeStorage } from '../reusables/Reusables'
import { clearSuccessMessage, fetchAllBookmarks, initializeBookmarkParentName, initializeBookmarks, initializeChildBookmarks, setBookmarkParentName, setCollectionBookmarks } from '../../state/slice/bookmarkSlice'
import { fetchAllFolders, initializeChildFolders, initializeCollectionAncestorFolders, initializeFolders, renameFolder, setCollectionAncestorFolders, setCollectionFolders } from '../../state/slice/folderSlice'
import { getChildBookmarks, getChildFolders, getParentFolders } from '../../utils/siderUtility/siderUtility'
import { bookmarkFoldersUpdate } from '../../utils/utility'

type RenameFolderValues = {
    folderName: string
}

const RenameFolder: React.FC = () => {
    const [notification, setNotification] = useState({ message: '', type: '' })
    const { createNotification } = useNotification()
    const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode)
    const {successMessage } = useSelector((state: RootState) => state.folders)
    const {bookmarks } = useSelector((state: RootState) => state.bookmarks)
    const section = useSelector((state: RootState) => state.sections.activeSection)
    const {collectionAncestorFolders } = useSelector(
        (state: RootState) => state.folders)
    const { folderIdToRenameOrDelete, folderNameToRenameOrDelete } 
        = useSelector((state: RootState) => state.reusable)
    const dispatch = useDispatch<AppDispatch>()

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
            dispatch(setShowRenameFolderModal(false))
          }
        }
      }, [notification])

      const renameFolderValidator = Yup.object({
        folderName: Yup.string().required('This field is required'),
      })
      const renameFolderInitialValues = {
        folderName: folderNameToRenameOrDelete || '',
     }

     const handleRenameFolderSubmit = async (
         values: RenameFolderValues,
         { setSubmitting }: FormikHelpers<RenameFolderValues>,
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
         let renameFolderData = {
            id: folderIdToRenameOrDelete,
            parentFolder: collectionAncestorFolders[collectionAncestorFolders.length - 1] || "/",
            name: values.folderName
         }
        
         try {
            await dispatch(renameFolder(renameFolderData)).unwrap()
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
                message: 'Folder renamed successfully',
                type: 'success',
            })
        } catch (err) {
            console.error('Rename folder error:', err)
            setNotification({
                message:
                err instanceof Error
                    ? err.message
                    : 'Failed to rename folder. Please try again',
                type: 'error',
            })
        } finally {
            setSubmitting(false)
        }
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
        <div className={isDarkMode ? "renameFolderContainerDark" : "renameFolderContainer"}>
            <div className='renameFolderContainerContent'>
                <img
                    src="images/close.svg"
                    alt="close"
                    className="createFolderModalClose"
                    onClick={() => {
                        dispatch(setShowRenameFolderModal(false))
                    }}
                />
                <h3
                    className={
                        isDarkMode ? 'createFolderHeaderDark' : 'createFolderHeader'
                    }
                >
                    Rename
                </h3>
                <Formik<RenameFolderValues>
                    initialValues={renameFolderInitialValues}
                    validationSchema={renameFolderValidator}
                    onSubmit={handleRenameFolderSubmit}
                    enableReinitialize
                >
                    {({ isSubmitting, isValid, dirty }) => (
                         <Form>
                            <div
                                className="createFolderNameErrorHolder">
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
                            style={{
                                marginBottom: "20px"
                            }}
                                type="submit"
                                disabled={!dirty || !isValid || isSubmitting}
                                className={`${
                                    !dirty || !isValid || isSubmitting
                                    ? 'createFolderBtnExtra'
                                    : 'createFolderBtn'
                                }`}
                                >
                                {isSubmitting ? 'Submitting...' : 'Rename'}
                            </button>
                         </Form>
                    )}
                </Formik>
            </div>
        </div>

    )
}
export default RenameFolder