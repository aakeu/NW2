import React, { useEffect, useState } from 'react'
import '../dashboard/DashboardSection.css'
import { useNotification } from '../notification/NotificationContext'
import {
  delete_gpt,
  delete_gpt_query,
  getGptHistory,
  getLatestGptResult,
} from '../../api/store_gpt_result'
import { getChromeStorage, setChromeStorage } from '../../utils/utility'

export default function GptDeleteModal({
  gptQuery,
  setGptModal,
  setShowQuestionAndAnswer,
  queryId,
  title,
  setSelectedGptHistory,
}) {
  const [notification, setNotification] = useState({ message: '', type: '' })
  const { createNotification } = useNotification()
  const [loading, setLoading] = useState(false)

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
        setGptModal(null)
      }
    }
  }, [notification])

  const handleDelete = async () => {
    setLoading(true)
    let response
    if (gptQuery && queryId) {
      response = await delete_gpt_query(gptQuery, queryId)
    }
    if (gptQuery && !queryId) {
      response = await delete_gpt(gptQuery)
    }
    setLoading(false)
    if (response.success) {
      setNotification({ message: response.message, type: 'success' })
      const existingGptResults = (await getChromeStorage(
        'gptStoredResult',
      )) || {
        allGptHistory: { today: [], p7days: [], pmonth: [], old: [] },
        allGptResults: [],
        activeChatId: null,
      }
      const gptHistoryData = await getGptHistory()
      const gptDataWithSameSession = await getLatestGptResult(gptQuery)

      let allGptResults = [...(existingGptResults.allGptResults || [])]

      if (gptDataWithSameSession && gptDataWithSameSession.id) {
        const index = allGptResults.findIndex(
          (data) => data.id === gptDataWithSameSession.id,
        )
        if (index !== -1) {
          allGptResults[index] = gptDataWithSameSession
        }
      }

      let updatedResults = {}

      if (gptQuery && !queryId) {
        updatedResults = {
          ...existingGptResults,
          allGptHistory: gptHistoryData,
        }
      }

      if (gptQuery && queryId) {
        updatedResults = {
          ...existingGptResults,
          allGptResults: allGptResults,
        }
        setSelectedGptHistory(gptDataWithSameSession)
      }

      await setChromeStorage({ gptStoredResult: updatedResults })
      if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({
          type: 'GET_GPT_DATA',
        })
      }
      if (gptQuery && !queryId) {
        setShowQuestionAndAnswer(false)
      } else {
        setShowQuestionAndAnswer(true)
      }
    } else {
      console.error(response.message)
      setNotification({ message: response.message, type: 'error' })
    }
  }
  return (
    <div className="dashboardSectionDeleteModal">
      <div className="dashboardSectionDeleteModalContainer">
        <h2 className="dashboardSectionDeleteModalHeader">Delete Gpt</h2>
        <div className="dashboardSectionDeleteModalInfo">
          <>{`Are you sure you want to delete gpt with title "${title}"`}?</>
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
            onClick={() => setGptModal(null)}
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
