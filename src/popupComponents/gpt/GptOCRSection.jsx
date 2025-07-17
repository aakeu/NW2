import React, { useEffect, useRef, useState } from 'react'
import '../gpt/GptSection.css'
import DOMPurify from 'dompurify'
import { handleFeatures, MoreFeatures, Spinner } from '../../utils/utility'
import GptMoreFeaturesModal from './GptMoreFeaturesModal'
import { useNotification } from '../notification/NotificationContext'

export default function GptOCRSection({ gptSubSection, userDetail }) {
  const [notification, setNotification] = useState({ message: '', type: '' })
  const [fileLoading, setFileLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [selectedFileName, setSelectedFileName] = useState('')
  const [ocrLoading, setOCRLoading] = useState(false)
  const [response, setResponse] = useState('')
  const [error, setError] = useState('')
  const [ocrResult, setOCRResult] = useState(null)
  const [convertingToSpeech, setConvertingToSpeech] = useState(false)
  const [audioUrl, setAudioUrl] = useState(null)
  const [convertingToSpeechError, setConvertingToSpeechError] = useState('')
  const [selectedOCRResponse, setSelectedOCRResponse] = useState(null)
  const { createNotification } = useNotification()
  const { handleOpenMoreFeatures, openMoreFeatures, setOpenMoreFeatures } =
    handleFeatures()

  const moreFeaturesTimeoutRef = useRef(null)
  const fileInputRef = useRef(null)
  const sanitizedContent = DOMPurify.sanitize(response)

  const copySelectedResponse = async (text) => {
    setSelectedOCRResponse(text)
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setTimeout(() => {
          setSelectedOCRResponse(null)
        }, 2000)
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err)
      })
  }

  const handleMoreFeaturesOutsideClick = (event) => {
    if (
      moreFeaturesTimeoutRef.current &&
      !moreFeaturesTimeoutRef.current.contains(event.target)
    ) {
      setOpenMoreFeatures(false)
    }
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

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']

    if (!allowedTypes.includes(file.type)) {
      setNotification({
        message:
          'Invalid file type. Please upload an image (PNG, JPG, JPEG, WEBP).',
        type: 'failure',
      })
      return
    }

    if (file.size > 15 * 1024 * 1024) {
      setNotification({
        message:
          'File size exceeds the 15MB limit. Please upload a smaller file.',
        type: 'failure',
      })
      return
    }

    setFileLoading(true)
    setSelectedFile(file)
    setSelectedFileName(file.name)

    const timeoutId = setTimeout(() => {
      setFileLoading(false)
    }, 500)

    return () => clearTimeout(timeoutId)
  }

  const removeSelectedFile = () => {
    setSelectedFile(null)
    setSelectedFileName('')

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  useEffect(() => {
    const convertTextToSpeech = async () => {
      if (ocrResult) {
        try {
          setAudioUrl(null)
          setConvertingToSpeech(true)
          const response = await fetch(
            `${process.env.REACT_APP_QAPI_URL}/gpts/text-to-speech`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${userDetail?.token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ text: ocrResult }),
            },
          )

          setConvertingToSpeech(false)

          if (!response.ok) {
            setConvertingToSpeechError('Failed to generate speech.')
          }

          const audioBlob = await response.blob()
          const url = URL.createObjectURL(audioBlob)
          setAudioUrl(url)
        } catch (err) {
          console.error('Error:', err)
          setConvertingToSpeechError(
            'An error occurred while processing your request.',
          )
        } finally {
          setConvertingToSpeech(false)
        }
      }
    }
    convertTextToSpeech()
  }, [ocrResult])

  useEffect(() => {
    const performOCR = async () => {
      if (selectedFileName) {
        try {
          setOCRLoading(true)
          setResponse('')
          setError(null)

          const formData = new FormData()
          formData.append('file', selectedFile)

          const response = await fetch(
            `${process.env.REACT_APP_QAPI_URL}/gpts/ocr`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${userDetail?.token}`,
              },
              body: formData,
            },
          )

          setOCRLoading(false)
          if (!response.ok) {
            const errorData = await response.json().catch(() => null)
            const errorMessage =
              errorData?.message ||
              'Something went wrong. Please try again later.'
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
          setOCRResult(responseData)
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
          setOCRLoading(false)
        }
      }
    }
    performOCR()
  }, [selectedFileName])

  useEffect(() => {
    document.addEventListener('mousedown', handleMoreFeaturesOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleMoreFeaturesOutsideClick)
    }
  }, [])

  return (
    <div className="gptOCRSectionContainer">
      <div className="gptOCRSectionHeader">
        <h3 className="gptOCRCaption">OCR</h3>
        <div
          style={{
            marginTop: '20px',
            marginRight: '15px',
            position: 'relative',
          }}
        >
          <MoreFeatures text={'Features'} onClick={handleOpenMoreFeatures} />
          {openMoreFeatures && (
            <GptMoreFeaturesModal
              ref={moreFeaturesTimeoutRef}
              customClass="gptMoreFeaturesExtra"
              gptSubSection={gptSubSection}
            />
          )}
        </div>
      </div>
      {fileLoading ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '20px auto',
            width: '50px',
            height: '50px',
          }}
        >
          <Spinner />
        </div>
      ) : selectedFileName ? (
        <div className="gptOCRFileContentsPreview">
          {selectedFile?.type.startsWith('image/') && (
            <img
              src={URL.createObjectURL(selectedFile)}
              alt="Uploaded Preview"
              className="gptOCRFileContentsImgPreview"
            />
          )}
          <div className="gptOCRFileContentsDelUploadHolder">
            <div className="gptOCRFileContentsDelUploadContents">
              <input
                ref={fileInputRef}
                id="file-upload"
                type="file"
                accept={
                  'image/png' || 'image/jpeg' || 'image/jpg' || 'image/webp'
                }
                className="hidden"
                onChange={handleFileChange}
                style={{
                  display: 'none',
                }}
              />
              <img
                src="images/popup/delete.svg"
                alt="delete"
                className="gptOCRFileContentsDeleteImg"
                onClick={removeSelectedFile}
              />
              <img
                src="images/popup/fileUpload.svg"
                alt="upload"
                className="gptOCRFileContentsUploadImg"
                onClick={triggerFileInput}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="gptOCRFileContents" onClick={triggerFileInput}>
          <input
            ref={fileInputRef}
            id="file-upload"
            type="file"
            accept={'image/png' || 'image/jpeg' || 'image/jpg' || 'image/webp'}
            className="hidden"
            onChange={handleFileChange}
            style={{
              display: 'none',
            }}
          />
          <img
            src="images/popup/fileUpload.svg"
            alt="upload"
            className="gptOCRFileContentsImg"
          />
          <p className="gptOCRFileContentsInfo">
            Click to upload an image to extract text
          </p>
          <span className="gptOCRFileContentsSize">Max. size: 15MB</span>
        </div>
      )}
      {ocrLoading ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Spinner />
        </div>
      ) : error ? (
        <div className="gptOCRError">{error}</div>
      ) : (
        <>
          {sanitizedContent && (
            <span className="gptOCRResultHolderHeader">Result</span>
          )}
          <div
            className="gptOCRResultHolder"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          ></div>
        </>
      )}
      {sanitizedContent && (
        <div className="gptTranslateCopyAudioContainer">
          {selectedOCRResponse === sanitizedContent && (
            <div className="gptTranslationCopiedDiv">Copied to clipboard</div>
          )}
          <img
            src="images/popup/copy.svg"
            alt="gpt action icon"
            className="gptActionIcon"
            onClick={() => copySelectedResponse(sanitizedContent)}
          />
          {convertingToSpeech ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '30px',
                height: '30px',
              }}
            >
              <Spinner />
            </div>
          ) : convertingToSpeechError ? (
            <span className="gptTranslateAudioError">
              {convertingToSpeechError}
            </span>
          ) : (
            audioUrl && (
              <audio className="gptTranslateAudio" controls>
                <source src={audioUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            )
          )}
        </div>
      )}
    </div>
  )
}
