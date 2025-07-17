import React, { useEffect, useRef, useState } from 'react'
import '../gpt/GptSection.css'
import GptSidebar from './GptSidebar'
import GptHeader from './GptHeader'
import GptPredefined from './GptPredefined'
import GptTextArea from './GptTextArea'
import GptQuestionAnswer from './GptQuestionAnswer'
import { getChromeStorage, setChromeStorage } from '../../utils/utility'
import Backdrop from '../backdrop/Backdrop'
import PaymentModal from '../paymentModal/PaymentModal'
import GptDeleteModal from './GptDeleteModal'
import {
  getGptHistory,
  getLatestGptResult,
  storeGptResult,
} from '../../api/store_gpt_result'
import GptTranslationSection from './GptTranslationSection'
import GptOCRSection from './GptOCRSection'

export default function GptSection({
  allGptStoredResults,
  gptHistory,
  userDetail,
  trackingRecord,
  gptSubSection,
  currentChatDetails
}) {
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isFullSidebar, setIsFullSidebar] = useState(false)
  const [showQuestionAndAnser, setShowQuestionAndAnswer] = useState(false)
  const [error, setError] = useState(null)
  const [hoveredPredefined, setHoveredPredefined] = useState(
    'How to make my day awesome',
  )
  const [gptResult, setGptResult] = useState(null)
  const [selectedGptHistory, setSelectedGptHistory] = useState(null)
  const [immediateResponse, setImmediateResponse] = useState(false)
  const [activationNeeded, setActivationNeeded] = useState(false)
  const [paymentModalInfo, setPaymentModalInfo] = useState(null)
  const [gptModal, setGptModal] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [selectedFileName, setSelectedFileName] = useState('')
  const [imageCreation, setImageCreation] = useState(false)
  const [activeChatId, setActiveChatId] = useState(null)
  const chatGptMainRef = useRef(null)

  const handlePredefinedText = (text) => {
    setHoveredPredefined(text)
  }

  useEffect(() => {
    const saveToChromeStorage = async () => {
      if (gptResult) {
        try {
          const existingGptResults = (await getChromeStorage(
            'gptStoredResult',
          )) || {
            allGptHistory: { today: [], p7days: [], pmonth: [], old: [] },
            allGptResults: [],
            activeChatId: null
          }

          let dataToStore = {}
          if (activeChatId) {
            dataToStore.id = activeChatId
            dataToStore.query = selectedFileName ? selectedFileName : query
            dataToStore.response = error ? error : gptResult
          } else {
            dataToStore.query = selectedFileName ? selectedFileName : query
            dataToStore.response = error ? error : gptResult
          }

          const storedGptResult = await storeGptResult(dataToStore)
          const gptHistoryData = await getGptHistory()
          const getLatestGptData = await getLatestGptResult(storedGptResult.id)

          let allGptResults = [...(existingGptResults.allGptResults || [])]
          if (getLatestGptData && getLatestGptData.id) {
            const index = allGptResults.findIndex(
              (data) => data.id === getLatestGptData.id,
            )
            if (index !== -1) {
              allGptResults[index] = getLatestGptData
            } else {
              allGptResults.push(getLatestGptData)
            }
          } else {
            console.warn('getLatestGptData is invalid:', getLatestGptData)
          }

          const updatedResults = {
            ...existingGptResults,
            allGptHistory: gptHistoryData,
            allGptResults: allGptResults,
            activeChatId: storedGptResult.id
          }

          await setChromeStorage({ gptStoredResult: updatedResults })

          if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
            chrome.runtime.sendMessage({
              type: 'GPT_STORED',
            })
          }
          if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
            chrome.runtime.sendMessage({
              type: 'GPT_ACTIVE_DETAILS',
            })
          }
          // await updateSelectedGptHistory()
        } catch (error) {
          console.error('Error storing GPT results:', error)
        }
      }
    }

    saveToChromeStorage()
  }, [gptResult])

  useEffect(() => {
    if (showQuestionAndAnser && chatGptMainRef.current) {
      chatGptMainRef.current.scrollTop = chatGptMainRef.current.scrollHeight
    }
  }, [showQuestionAndAnser])

  const handleCreateImage = async (query) => {
    console.log('The query', query)
    setLoading(true)
    setResponse('')
    setError(null)

    try {
      const response = await fetch(
        `${process.env.REACT_APP_QAPI_URL}/gpts/generate-logos`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userDetail?.token}`,
          },
          body: JSON.stringify({ name: query }),
        },
      )

      setLoading(false)
      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        const errorMessage =
          errorData?.message || 'Something went wrong. Please try again later.'
        throw new Error(errorMessage)
      }

      if (!response.body) {
        throw new Error('Stream response body is null.')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder('utf-8')

      let responseData = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        responseData += chunk

        setResponse((prevContent) => prevContent + chunk)
      }
      if (!showQuestionAndAnser) {
        const gptPage = (await getChromeStorage('gptPage')) || 1
        await setChromeStorage({ gptPage: Number(gptPage) + 1 })
      }
      setGptResult(responseData)
      // setImmediateResponse(false)
      if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({
          type: 'CHAT_GPT_USED',
        })
      }
    } catch (err) {
      let errorMessage = 'Something went wrong. Please try again later.'

      if (
        err.message.includes('Unauthenticated') ||
        err.message.includes('401')
      ) {
        errorMessage = 'Your session has expired. Please log in again.'
      } else if (
        err.message.includes('500') ||
        err.message.includes('Internal Server Error')
      ) {
        errorMessage = 'Something went wrong. Please try again later.'
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleAsk = async (query) => {
    setLoading(true)
    setResponse('')
    setError(null)

    try {
      const formData = new FormData()

      if (query) {
        formData.append('query', query)
      }
      if (selectedFile) {
        formData.append('file', selectedFile)
        setQuery(selectedFileName ? selectedFileName : query)
      }

      const response = await fetch(
        `${process.env.REACT_APP_QAPI_URL}/gpts/stream-gpt`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${userDetail?.token}`,
          },
          body: formData,
        },
      )

      setLoading(false)

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        const errorMessage =
          errorData?.message || 'Something went wrong. Please try again later.'
        throw new Error(errorMessage)
      }

      if (!response.body) {
        throw new Error('Stream response body is null.')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder('utf-8')

      let responseData = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        responseData += chunk

        setResponse((prevContent) => prevContent + chunk)
      }
      if (!showQuestionAndAnser) {
        const gptPage = (await getChromeStorage('gptPage')) || 1
        await setChromeStorage({ gptPage: Number(gptPage) + 1 })
      }
      setGptResult(responseData)
      // setImmediateResponse(false)
      if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({
          type: 'CHAT_GPT_USED',
        })
      }
    } catch (err) {
      let errorMessage = 'Something went wrong. Please try again later.'

      if (
        err.message.includes('Unauthenticated') ||
        err.message.includes('401')
      ) {
        errorMessage = 'Your session has expired. Please log in again.'
      } else if (
        err.message.includes('500') ||
        err.message.includes('Internal Server Error')
      ) {
        errorMessage = 'Something went wrong. Please try again later.'
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {gptSubSection === 'mainGptSection' && (
        <div
          className={
            isFullSidebar ? 'chatGptContainerExtra' : 'chatGptContainer'
          }
        >
          <GptSidebar
            isFullSidebar={isFullSidebar}
            setShowQuestionAndAnswer={setShowQuestionAndAnswer}
            gptHistory={gptHistory}
            setSelectedGptHistory={setSelectedGptHistory}
            setGptModal={setGptModal}
            allGptStoredResults={allGptStoredResults}
            setActiveChatId={setActiveChatId}
            currentChatDetails={currentChatDetails}
            setImmediateResponse={setImmediateResponse}
            activeChatId={activeChatId}
          />
          <div className={'chatGptMain'} ref={chatGptMainRef}>
            <GptHeader
              setIsFullSidebar={setIsFullSidebar}
              isFullSidebar={isFullSidebar}
              gptSubSection={'mainGptSection'}
            />
            <div className="chatGptMainContents">
              {showQuestionAndAnser && (
                <GptQuestionAnswer
                  response={response}
                  query={selectedFileName ? selectedFileName : query}
                  selectedGptHistory={selectedGptHistory}
                  immediateResponse={immediateResponse}
                  userDetail={userDetail}
                  selectedFileName={selectedFileName}
                  loading={loading}
                  setGptModal={setGptModal}
                  activeChatId={activeChatId}
                />
              )}
              {!showQuestionAndAnser && (
                <GptPredefined
                  hoveredPredefined={hoveredPredefined}
                  handlePredefinedText={handlePredefinedText}
                  setShowQuestionAndAnswer={setShowQuestionAndAnswer}
                  handleAsk={handleAsk}
                  setQuery={setQuery}
                  setImmediateResponse={setImmediateResponse}
                  userDetail={userDetail}
                  setActivationNeeded={setActivationNeeded}
                  setPaymentModalInfo={setPaymentModalInfo}
                  trackingRecord={trackingRecord}
                />
              )}
            </div>
            <GptTextArea
              isFullSidebar={isFullSidebar}
              handleAsk={handleAsk}
              loading={loading}
              setShowQuestionAndAnswer={setShowQuestionAndAnswer}
              setQuery={setQuery}
              showQuestionAndAnser={showQuestionAndAnser}
              setImmediateResponse={setImmediateResponse}
              userDetail={userDetail}
              setActivationNeeded={setActivationNeeded}
              setPaymentModalInfo={setPaymentModalInfo}
              trackingRecord={trackingRecord}
              setSelectedFile={setSelectedFile}
              setSelectedFileName={setSelectedFileName}
              selectedFileName={selectedFileName}
              selectedFile={selectedFile}
              handleCreateImage={handleCreateImage}
              imageCreation={imageCreation}
              setImageCreation={setImageCreation}
            />
          </div>
          {activationNeeded && (
            <>
              <Backdrop />
              <PaymentModal
                setActivationNeeded={setActivationNeeded}
                info={paymentModalInfo}
              />
            </>
          )}
          {gptModal?.id && (
            <>
              <Backdrop />
              <GptDeleteModal
                gptQuery={gptModal?.id}
                setGptModal={setGptModal}
                setShowQuestionAndAnswer={setShowQuestionAndAnswer}
                queryId={gptModal?.queryId}
                title={gptModal?.title}
                setSelectedGptHistory={setSelectedGptHistory}
              />
            </>
          )}
        </div>
      )}
      {gptSubSection === 'gptTranslateSection' && (
        <div
          style={{
            padding: '10px',
          }}
        >
          <GptTranslationSection
            gptSubSection={'gptTranslateSection'}
            userDetail={userDetail}
          />
        </div>
      )}
      {gptSubSection === 'gptOCRSection' && (
        <div
          style={{
            padding: '10px',
          }}
        >
          <GptOCRSection
            gptSubSection={'gptOCRSection'}
            userDetail={userDetail}
          />
        </div>
      )}
    </>
  )
}
