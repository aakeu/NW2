import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../../state'
import '../../deleteModal/DeleteModal.css'
import { toast } from 'react-toastify';
import { delete_gpt_query } from '../../../state/slice/gpt/gptApi';

export default function DeleteChat({
    details,
    refreshQuery,
    setDelete
}: { 
    setDelete: (arg: { id: number; value: string }, off?: boolean) => void;
    refreshQuery: (arg:void) => void;
    details: {
        id: number;
        chatId: number;
        value: string
    }
}) {
  const {isDarkMode} = useSelector((state:RootState)=>state.theme)
  const [isDeleting, setIsDeleting] = useState(false)

  const closeModal = () => setDelete({id: 0,value:''}, true)

  async function handleDelete(){
    setIsDeleting(true)
    const del_query = await delete_gpt_query(details.chatId, details.id)
    if(del_query.success){
        setIsDeleting(false)
        refreshQuery()
        closeModal()
        toast.success(del_query.message)

        return;
    }
    
    setIsDeleting(false)
    toast.error(del_query.message)
  }

  return (
    <div className={isDarkMode ? "deleteModalDark" : "deleteModal"}>
        <div className="deleteModalContent">
            <img
                src="images/close.svg"
                alt="close"
                className="deleteModalClose"
                onClick={closeModal}
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
            <span className={`delete-modal-context-chat ${isDarkMode && "chat-dark"}`}>
                {details.value}
            </span>
            <div className="deleteModalContentButtons">
                <button
                    className={isDarkMode ? "deleteModalDeleteButtonDark" : "deleteModalDeleteButton"}
                    onClick={handleDelete}
                >
                    {isDeleting ? "Deleting..." : "Delete"}
                </button>
                <button
                    className={isDarkMode ? "deleteModalCancelButtonDark" : "deleteModalCancelButton"}
                    onClick={closeModal}
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
