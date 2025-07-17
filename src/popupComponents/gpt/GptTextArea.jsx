import React, { useState, useRef, useEffect } from 'react'
import * as Yup from 'yup'
import { Formik, Form, Field } from 'formik'
import '../gpt/GptSection.css'
import { useNotification } from '../notification/NotificationContext'
import { AttachFileInfo } from './ReusableTooltip'
import GptSummarizeOptions from './GptSummarizeOptions'
import GptOpenCreateImage from './GptOpenCreateImage'

export default function GptTextArea({
  isFullSidebar,
  handleAsk,
  loading,
  setShowQuestionAndAnswer,
  setQuery,
  showQuestionAndAnser,
  setImmediateResponse,
  userDetail,
  setActivationNeeded,
  setPaymentModalInfo,
  trackingRecord,
  setSelectedFile,
  setSelectedFileName,
  selectedFileName,
  selectedFile,
  handleCreateImage,
  imageCreation,
  setImageCreation,
}) {
  const [fileLoading, setFileLoading] = useState(false)
  const [attachFileInfo, setAttachFileInfo] = useState(false)
  const [openSummarizeOptions, setOpenSummarizeOptions] = useState(false)
  const [summarizeFileInfo, setSummarizeFileInfo] = useState(false)
  const [openCreateImage, setOpenCreateImage] = useState(false)
  const [textboxText, setTextboxText] = useState('')
  const [notification, setNotification] = useState({ message: '', type: '' })
  const { createNotification } = useNotification()
  const fileInputRef = useRef(null)
  const attachFileInfoTimeout = useRef(null)
  const openSummarizeOptionsTimeout = useRef(null)
  const summarizeFileInfoTimeout = useRef(null)
  const openCreateImageTimeout = useRef(null)

  const showOpenCreateImage = () => {
    openCreateImageTimeout.current = setTimeout(() => {
      setOpenCreateImage(true)
      setImageCreation(true)
      setOpenSummarizeOptions(false)
      setTextboxText('Generate')
    }, 500)
  }

  const hideCreateImage = () => {
    if (openCreateImageTimeout.current) {
      clearTimeout(openCreateImageTimeout.current)
      openCreateImageTimeout.current = null
    }
    setOpenCreateImage(false)
  }

  const showSummarizeFileInfo = () => {
    summarizeFileInfoTimeout.current = setTimeout(() => {
      setSummarizeFileInfo(true)
    })
  }

  const hideSummarizeFileInfo = () => {
    if (summarizeFileInfoTimeout.current) {
      clearTimeout(summarizeFileInfoTimeout.current)
      summarizeFileInfoTimeout.current = null
    }
    setSummarizeFileInfo(textboxText === 'Summarize' ? false : true)
  }

  const openSummarize = () => {
    openSummarizeOptionsTimeout.current = setTimeout(() => {
      setOpenSummarizeOptions(true)
      setOpenCreateImage(false)
      showSummarizeFileInfo()
      setTextboxText('Summarize')
      // removeSelectedFile()
    }, 500)
  }

  const showAttachFileInfo = () => {
    attachFileInfoTimeout.current = setTimeout(() => {
      setAttachFileInfo(true)
    }, 1000)
  }
  const hideAttachFileInfo = () => {
    if (attachFileInfoTimeout.current) {
      clearTimeout(attachFileInfoTimeout.current)
      attachFileInfoTimeout.current = null
    }
    setAttachFileInfo(false)
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
    }
  }, [notification])

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/csv',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp',
    ]

    const allowedSummarizeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]

    const isImage = file.type.startsWith('image/')
    const isPdf = file.type === 'application/pdf'
    const isWord =
      file.type === 'application/msword' ||
      file.type ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

    const isExcel =
      file.type === 'application/vnd.ms-excel' ||
      file.type ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

    if (openSummarizeOptions && !allowedSummarizeTypes.includes(file.type)) {
      setNotification({
        message:
          'Invalid file type. Please upload a PDF, Word document or Excel file.',
        type: 'failure',
      })
      return
    } else if (!allowedTypes.includes(file.type)) {
      setNotification({
        message:
          'Invalid file type. Please upload a PDF, Word document, Excel file, CSV file or an image (PNG, JPG, WEBP).',
        type: 'failure',
      })
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setNotification({
        message:
          'File size exceeds the 10MB limit. Please upload a smaller file.',
        type: 'failure',
      })
      return
    }

    setFileLoading(true)
    setSelectedFile(file)
    setSelectedFileName(file.name)

    const timeoutId = setTimeout(() => {
      setFileLoading(false)
      if (
        openSummarizeOptions &&
        textboxText !== 'Summarize' &&
        file.name !== ''
      ) {
        setSummarizeFileInfo(false)
        setOpenSummarizeOptions(false)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }

  const removeSelectedFile = () => {
    setSelectedFile(null)
    setSelectedFileName('')
    setTextboxText('')

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
      hideAttachFileInfo()
    }
  }

  const chatGptTextAreaInitialValues = {
    chatGptTextArea: textboxText ? textboxText : '',
  }
  const chatGptTextAreaValidator = Yup.object({
    chatGptTextArea: Yup.string(),
  })
  const handleGptSubmit = async (values, { setSubmitting, resetForm }) => {
    const isQuery = values.chatGptTextArea.trim() !== ''
    const isFileUploaded = selectedFileName !== ''

    if (!values.chatGptTextArea && !selectedFileName) {
      alert('Please enter a query or attach a word, PDF/Image file.')
      return
    }
    if (
      trackingRecord &&
      trackingRecord.noOfTimesChatGptIsUsed > 1000 &&
      !userDetail?.user?.isSubscribed
    ) {
      setActivationNeeded(true)
      setPaymentModalInfo(
        'With your current plan, you cannot use this service. Upgrade your plan to access this service!',
      )
    } else {
      if (imageCreation) {
        handleCreateImage(values.chatGptTextArea)
      } else {
        handleAsk(values.chatGptTextArea)
      }
      setShowQuestionAndAnswer(true)
      setQuery(values.chatGptTextArea)
      setImmediateResponse(true)

      if (isQuery && !isFileUploaded) {
        resetForm()
      } else if (isQuery && isFileUploaded) {
        resetForm()
        removeSelectedFile()
      } else {
        removeSelectedFile()
      }

      setSubmitting(loading)
    }
  }
  return (
    <>
      <div
        className={
          isFullSidebar
            ? 'chatGptTextAreaContainerExtra'
            : 'chatGptTextAreaContainer'
        }
      >
        <Formik
          initialValues={chatGptTextAreaInitialValues}
          validationSchema={chatGptTextAreaValidator}
          onSubmit={handleGptSubmit}
          enableReinitialize
        >
          {({ values, isSubmitting }) => {
            const isButtonEnabledWhenSummaryTextOpen =
              textboxText !== 'Summarize' && selectedFileName !== ''
            const isButtonEnabled =
              values.chatGptTextArea.trim().length > 0 ||
              (values.chatGptTextArea.trim().length > 0 &&
                selectedFileName !== '')
            const isButtonEnabledWhenCreateImageOpen =
              openCreateImage &&
              textboxText !== 'Generate' &&
              textboxText !== 'Generate logo for a company named' &&
              textboxText !== 'Generate UI designs of'

            return (
              <Form>
                <div
                  className={
                    isFullSidebar
                      ? 'chatGptTextAreaContentsHolderExtra'
                      : 'chatGptTextAreaContentsHolder'
                  }
                >
                  <Field name="chatGptTextArea">
                    {({ field }) => (
                      <textarea
                        className="chatGptTextArea"
                        name="chatGptTextArea"
                        rows={2}
                        placeholder="Enter prompt..."
                        {...field}
                      ></textarea>
                    )}
                  </Field>
                  <div className="chatGptTextAreaActionHolder">
                    <input
                      ref={fileInputRef}
                      id="file-upload"
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={handleFileChange}
                      style={{
                        display: 'none',
                      }}
                    />
                    <div className="chatGptPrepContainer">
                      <div
                        className="chatGptPrepCreateImageHolder"
                        onClick={showOpenCreateImage}
                      >
                        <img
                          src="images/popup/createimg.svg"
                          alt="img"
                          className="chatGptPrepCreateImg"
                        />
                        Create Image
                      </div>
                      <div
                        className="chatGptPrepSummarizeTextHolder"
                        onClick={openSummarize}
                      >
                        <img
                          src="images/popup/summarizetxt.svg"
                          alt="img"
                          className="chatGptPrepSummarizeTxtImg"
                        />
                        Summarize text
                      </div>
                    </div>
                    <div className="chatGptTextAreaBtnActionHolder">
                      {selectedFileName && (
                        <div className="chatGptTextAreaBtnActionAttachmentContainer">
                          {selectedFile?.type.startsWith('image/') ? (
                            <img
                              src={URL.createObjectURL(selectedFile)}
                              alt="Uploaded Preview"
                              className="chatGptUploadImgPreview"
                            />
                          ) : (
                            <span className="chatGptTextAreaBtnActionAttachmentHolder">
                              {selectedFileName.length > 10
                                ? selectedFileName.slice(0, 10) + '...'
                                : selectedFileName}
                            </span>
                          )}
                          <span
                            onClick={removeSelectedFile}
                            className="chatGptTextAreaBtnActionAttachmentClose"
                          >
                            X
                          </span>
                        </div>
                      )}
                      {!selectedFileName && (
                        <div
                          className="chatGptTextAreaBtnActionAttachmentHolder"
                          onClick={triggerFileInput}
                          onMouseEnter={(e) => {
                            e.stopPropagation()
                            !summarizeFileInfo && showAttachFileInfo()
                          }}
                          onMouseLeave={(e) => {
                            e.stopPropagation()
                            hideAttachFileInfo()
                          }}
                        >
                          <img
                            src={'images/popup/chatGptAttachment.svg'}
                            alt={'gpt attachment icon'}
                            className="chatGptTextAreaBtnActionAttachment"
                          />
                          {fileLoading ? (
                            <span>loading file....</span>
                          ) : (
                            <span>Attach File</span>
                          )}
                        </div>
                      )}
                      {attachFileInfo && (
                        <AttachFileInfo
                          text="Attach PDF, Word document, Excel document, CSV file or image file and ask associated question in the textbox"
                          style={{}}
                        />
                      )}
                      {summarizeFileInfo && (
                        <AttachFileInfo
                          text="Attach File"
                          style={{ marginTop: '-32px', width: '100px' }}
                        />
                      )}
                      <button
                        className={`${
                          (
                            openSummarizeOptions
                              ? isButtonEnabledWhenSummaryTextOpen
                              : isButtonEnabled ||
                                isButtonEnabledWhenCreateImageOpen
                          )
                            ? 'chatGptBtnSend'
                            : 'chatGptBtnSendExtra'
                        }`}
                        type="submit"
                        disabled={
                          openSummarizeOptions
                            ? !(isButtonEnabledWhenSummaryTextOpen ?? false) ||
                              isSubmitting
                            : !(
                                isButtonEnabled ||
                                isButtonEnabledWhenCreateImageOpen
                              ) || isSubmitting
                        }
                      >
                        <img
                          src={'images/popup/chatGptSendIcon.svg'}
                          alt={'gpt send icon'}
                          className="chatGptBtnSendImgIcon"
                        />
                        {isSubmitting ? 'Submitting...' : 'SEND'}
                      </button>
                    </div>
                    {openSummarizeOptions && (
                      <GptSummarizeOptions
                        setOpenSummarizeOptions={setOpenSummarizeOptions}
                        hideSummarizeFileInfo={hideSummarizeFileInfo}
                        textboxText={textboxText}
                        setTextboxText={setTextboxText}
                        setSelectedFileName={setSelectedFileName}
                      />
                    )}
                    {openCreateImage && (
                      <GptOpenCreateImage
                        setOpenCreateImage={setOpenCreateImage}
                        textboxText={textboxText}
                        setTextboxText={setTextboxText}
                        hideCreateImage={hideCreateImage}
                      />
                    )}
                  </div>
                </div>
              </Form>
            )
          }}
        </Formik>
      </div>
    </>
  )
}
