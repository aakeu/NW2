import React, { useEffect, useRef } from 'react'
import '../gpt/GptSection.css'
import { summaryTexts } from '../../utils/utility'

export default function GptSummarizeOptions({
  setOpenSummarizeOptions,
  hideSummarizeFileInfo,
  textboxText,
  setTextboxText,
  setSelectedFileName,
}) {
  const gptSummarizeOptionsRef = useRef(null)

  const handleSelectSummarizeText = (text) => {
    switch (text) {
      case 'Summarize my lease agreement':
        setTextboxText('Summarize attached lease agreement')
        break
      case 'Summarize notes from a meeting':
        setTextboxText('Summarize attached notes from a meeting')
        break
      case 'Summarize chapter 1 of a book':
        setTextboxText('Summarize chapter 1 of the attached file')
        break
      case 'Summarize a research paper':
        setTextboxText('Summarize attached research paper')
        break
      default:
        break
    }
  }

  const handleClickOutside = (event) => {
    if (
      gptSummarizeOptionsRef.current &&
      !gptSummarizeOptionsRef.current.contains(event.target)
    ) {
      setOpenSummarizeOptions(textboxText === 'Summarize' ? false : true)
      setSelectedFileName('')
      hideSummarizeFileInfo()
      setTextboxText((prevText) => {
        const newText = prevText === 'Summarize' ? '' : prevText
        return newText
      })
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [textboxText])

  return (
    <div ref={gptSummarizeOptionsRef} className="gptSummarizeOptions">
      <div className="gptSummarizeOptionsContents">
        {summaryTexts().map((data, index) => (
          <span
            className="gptSummarizeText"
            key={`${data}-${index}`}
            onClick={() => handleSelectSummarizeText(data)}
          >
            {data}
          </span>
        ))}
      </div>
    </div>
  )
}
