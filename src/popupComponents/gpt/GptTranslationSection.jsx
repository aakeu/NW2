import React, { useEffect, useRef, useState } from 'react'
import '../gpt/GptSection.css'
import DOMPurify from 'dompurify'
import {
  copySelectedResponse,
  handleFeatures,
  MoreFeatures,
  Spinner,
} from '../../utils/utility'
import GptMoreFeaturesModal from './GptMoreFeaturesModal'
import GptLanguages from './GptLanguages'
import { useDebounce } from '../../utils/debounceAndThrottle'

export default function GptTranslationSection({ gptSubSection, userDetail }) {
  const [openSourceModal, setOpenSourceModal] = useState(false)
  const [openTargetModal, setOpenTargetModal] = useState(false)
  const [selectedSourceLanguage, setSelectedSourceLanguage] =
    useState('English')
  const [selectedTargetLanguage, setSelectedTargetLanguage] =
    useState('Japanese')
  const [languages, setLanguages] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [translationTextArea, setTranslationTextArea] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const [sameSourceTargetError, setSameSourceTargetError] = useState('')
  const [translating, setTranslating] = useState(false)
  const [response, setResponse] = useState('')
  const [error, setError] = useState(null)
  const [translationData, setTranslationData] = useState(null)
  const [convertingToSpeech, setConvertingToSpeech] = useState(false)
  const [convertingToSpeechError, setConvertingToSpeechError] = useState('')
  const [audioUrl, setAudioUrl] = useState(null)
  const [selectedTranslationResponse, setSelectedTranslationResponse] =
    useState(null)
  const { handleOpenMoreFeatures, openMoreFeatures, setOpenMoreFeatures } =
    handleFeatures()

  const moreFeaturesTimeoutRef = useRef(null)
  const openSourceModalTimeoutRef = useRef(null)
  const openLanguagesTimeoutRef = useRef(null)

  const sanitizedContent = DOMPurify.sanitize(response)

  const copySelectedResponse = async (text) => {
    setSelectedTranslationResponse(text)
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setTimeout(() => {
          setSelectedTranslationResponse(null)
        }, 2000)
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err)
      })
  }

  const handleSwapLanguages = () => {
    setTimeout(() => {
      setSelectedTargetLanguage(selectedSourceLanguage)
      setSelectedSourceLanguage(selectedTargetLanguage)
    }, 400)
  }

  useEffect(() => {
    const convertTextToSpeech = async () => {
      if (translationData) {
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
              body: JSON.stringify({ text: translationData }),
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
  }, [translationData])

  const handleTranslate = async () => {
    setTranslating(true)
    setResponse('')
    setTranslationData(null)
    setError(null)

    try {
      const response = await fetch(
        `${process.env.REACT_APP_QAPI_URL}/gpts/translate`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${userDetail?.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: translationTextArea,
            targetLanguage: selectedTargetLanguage,
          }),
        },
      )
      setTranslating(false)
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
      setTranslationData(responseData)
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
      setTranslating(false)
    }
  }

  useEffect(() => {
    if (!selectedSourceLanguage || !selectedTargetLanguage) return

    if (selectedSourceLanguage === selectedTargetLanguage) {
      setSameSourceTargetError(
        'Source and Target languages should not be the same.',
      )
    } else {
      setSameSourceTargetError('')
    }
  }, [selectedSourceLanguage, selectedTargetLanguage])

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await fetch('https://libretranslate.com/languages')
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        const data = await response.json()

        if (!Array.isArray(data)) {
          throw new Error('Invalid data format received')
        }

        const results = data.map((lang) => lang.name)

        if (results.length > 0) {
          setLanguages(results)
        } else {
          throw new Error('No languages found')
        }
      } catch (error) {
        console.error('Error fetching languages:', error)
        setLanguages([])
      }
    }

    fetchLanguages()
  }, [])

  const handleOutsideLanguagesClick = (event) => {
    if (
      openLanguagesTimeoutRef.current &&
      !openLanguagesTimeoutRef.current.contains(event.target)
    ) {
      setOpenSourceModal(false)
      setOpenTargetModal(false)
    }
  }

  const handleOpenTargetLanguage = () => {
    openSourceModalTimeoutRef.current = setTimeout(() => {
      setOpenTargetModal(!openTargetModal)
      setOpenSourceModal(false)
    }, 500)
  }

  const handleOpenSourceLanguage = () => {
    openSourceModalTimeoutRef.current = setTimeout(() => {
      setOpenSourceModal(!openSourceModal)
      setOpenTargetModal(false)
    }, 500)
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
    document.addEventListener('mousedown', handleOutsideLanguagesClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideLanguagesClick)
    }
  }, [])

  useEffect(() => {
    document.addEventListener('mousedown', handleMoreFeaturesOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleMoreFeaturesOutsideClick)
    }
  }, [])

  return (
    <div className="gptTranslateSectionContainer">
      <div className="gptTranslationSectionHeader">
        <h3 className="gptTranslationCaption">Translate</h3>
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
      <div className="gptTranslateSectionContents">
        <div className="gptTranslateSectionContentHeader">
          <div
            className="gptTranslateSectionSourceContainer"
            onClick={handleOpenSourceLanguage}
          >
            <div className="gptTranslationSourceHolder">
              {selectedSourceLanguage}
            </div>
            <img
              src={
                openSourceModal ? 'images/popup/upArrow.svg' : 'images/popup/downArrow.svg'
              }
              alt="switch icon"
              className="gptTranslationArrow"
            />
            {openSourceModal && (
              <GptLanguages
                ref={openLanguagesTimeoutRef}
                setSelectedSourceLanguage={setSelectedSourceLanguage}
                setSelectedTargetLanguage={setSelectedTargetLanguage}
                openSourceModal={openSourceModal}
                openTargetModal={openTargetModal}
                languages={languages}
                setLanguages={setLanguages}
                searchTerm={debouncedSearchTerm}
                setSearchTerm={setSearchTerm}
                setOpenSourceModal={setOpenSourceModal}
                setOpenTargetModal={setOpenTargetModal}
              />
            )}
          </div>
          {translationTextArea && translationTextArea.length > 1 ? (
            <img
              src="images/popup/switch.svg"
              alt="switch icon"
              className="gptTranslationSwitchIcon"
              onClick={handleSwapLanguages}
            />
          ) : (
            <img
              src="images/popup/disabledSwitch.svg"
              alt="switch icon"
              className="gptTranslationDisabledSwitchIcon"
            />
          )}
          <div
            className="gptTranslationTargetContainer"
            onClick={handleOpenTargetLanguage}
          >
            <div className="gptTranslationTargetHolder">
              {selectedTargetLanguage}
            </div>
            <img
              src={
                openTargetModal ? 'images/popup/upArrow.svg' : 'images/popup/downArrow.svg'
              }
              alt="switch icon"
              className="gptTranslationArrow"
            />
            {openTargetModal && (
              <GptLanguages
                ref={openLanguagesTimeoutRef}
                customClass="gptLanguageExtra"
                setSelectedSourceLanguage={setSelectedSourceLanguage}
                setSelectedTargetLanguage={setSelectedTargetLanguage}
                openSourceModal={openSourceModal}
                openTargetModal={openTargetModal}
                languages={languages}
                setLanguages={setLanguages}
                searchTerm={debouncedSearchTerm}
                setSearchTerm={setSearchTerm}
                setOpenSourceModal={setOpenSourceModal}
                setOpenTargetModal={setOpenTargetModal}
              />
            )}
          </div>
        </div>
        <textarea
          className="gptTranslationTextarea"
          rows={5}
          placeholder="Type or paste text here..."
          name="translationTextArea"
          value={translationTextArea}
          onChange={(e) => setTranslationTextArea(e.target.value)}
        />
        <button
          disabled={
            !translationTextArea ||
            selectedSourceLanguage === selectedTargetLanguage
          }
          className={
            translationTextArea &&
            selectedSourceLanguage !== selectedTargetLanguage
              ? 'gptTranslateBtn'
              : 'gptTranslateBtnExtra'
          }
          onClick={handleTranslate}
        >
          {translating ? 'submitting...' : 'Translate'}
        </button>
      </div>
      {sameSourceTargetError && (
        <span className="gptTranslationLanguageError">
          {sameSourceTargetError}
        </span>
      )}
      {translating ? (
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
        <div className="gptTranslationError">{error}</div>
      ) : (
        <div
          className="gptTranslateSectionResult"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        ></div>
      )}
      {sanitizedContent && (
        <div className="gptTranslateCopyAudioContainer">
          {selectedTranslationResponse === sanitizedContent && (
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
