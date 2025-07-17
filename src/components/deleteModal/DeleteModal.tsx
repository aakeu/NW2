import React, { useEffect, useState } from "react";
import '../deleteModal/DeleteModal.css';
import { AppDispatch, RootState } from "../../state";
import { useDispatch, useSelector } from "react-redux";
import { setDeleteModal } from "../../state/slice/reusableStatesSlice";
import { deleteFolder, fetchAllFolders, initializeChildFolders, initializeCollectionAncestorFolders, initializeFolders, setCollectionAncestorFolders, setCollectionFolders } from "../../state/slice/folderSlice";
import { deleteBookmark, fetchAllBookmarks, initializeBookmarkParentName, initializeBookmarks, initializeChildBookmarks, setBookmarkParentName, setCollectionBookmarks } from "../../state/slice/bookmarkSlice";
import { getChildBookmarks, getChildFolders, getParentFolders } from "../../utils/siderUtility/siderUtility";
import { bookmarkFoldersUpdate } from "../../utils/utility";
import { useNotification } from "../notification/NotificationContext";
import { deleteFavorite, fetchAllFavorites, initializeFavorites } from "../../state/slice/favoriteSlice";

const DeleteModal: React.FC = () => {
    const [notification, setNotification] = useState({ message: '', type: '' })
    const [deleting, setDeleting] = useState(false)
    const { createNotification } = useNotification()
    const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
    const { itemNameToDelete, itemToDeleteId, isFolder, isBookmark, isDeleteFromFavorite } 
        = useSelector((state: RootState) => state.reusable)
    const {collectionAncestorFolders, folders } = useSelector(
            (state: RootState) => state.folders)
    const {bookmarks } = useSelector((state: RootState) => state.bookmarks)
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
                dispatch(setDeleteModal(false))
            }
        }
    }, [notification])

    const handleDelete = async () => {
         try {
            setDeleting(true)
            if (isFolder) {
                await dispatch(deleteFolder({ id: itemToDeleteId })).unwrap()
            }
            if (isBookmark) {
                if (isDeleteFromFavorite) {
                    await dispatch(deleteFavorite({ id: itemToDeleteId })).unwrap()
                } else {
                    await dispatch(deleteBookmark({ id: itemToDeleteId })).unwrap()
                }
            }

            await dispatch(fetchAllFolders())
            await dispatch(fetchAllBookmarks())   
            await dispatch(fetchAllFavorites())         
        
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
                dispatch(initializeCollectionAncestorFolders()),
                dispatch(initializeFavorites())    
            ])
            bookmarkFoldersUpdate()
            setNotification({
                message: isFolder ? 'Folder deleted successfully' : 'Bookmark deleted successfully',
                type: 'success',
            })
        } catch (err) {
            // console.error('Delete folder error:', err)
            setNotification({
                message:
                err instanceof Error
                    ? err.message
                    : isFolder ? 'Failed to delete folder. Please try again' : 
                    'Failed to delete bookmark. Please try again',
                type: 'error',
            })
        } finally {
            setDeleting(false)
        }
    }

    return (
        <div className={isDarkMode ? "deleteModalDark" : "deleteModal"}>
            <div className="deleteModalContent">
                <img
                    src="images/close.svg"
                    alt="close"
                    className="deleteModalClose"
                    onClick={() => {
                        dispatch(setDeleteModal(false))
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
                    {isBookmark ? 
                        itemNameToDelete && itemNameToDelete?.length > 60 
                        ? itemNameToDelete?.slice(0, 60) + "..."
                        : itemNameToDelete 
                    : itemNameToDelete
                    } {isFolder && "and its contents"}
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
                            dispatch(setDeleteModal(false))
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
    );
}

export default DeleteModal;