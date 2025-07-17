import React, { useEffect, useRef } from 'react'
import '../gpt/GptSection.css'
import { generateTexts } from '../../utils/utility'

export default function GptOpenCreateImage({
  setOpenCreateImage,
  textboxText,
  setTextboxText,
  hideCreateImage
}) {
  const gptOpenCreateImageRef = useRef(null)

  const handleOpenCreateImageText = (text) => {
    switch (text) {
      case 'Generate company logo':
        setTextboxText('Generate logo for a company named')
        break
      case 'Generate UI Design':
        setTextboxText('Generate UI designs of')
        break
      default:
        break
    }
  }

  const handleClickOutside = (event) => {
    if (
      gptOpenCreateImageRef.current &&
      !gptOpenCreateImageRef.current.contains(event.target)
    ) {
      setOpenCreateImage(textboxText === 'Generate' ? false : true)
      hideCreateImage()
      setTextboxText((prevText) => {
        const newText = prevText === "Generate" ? '' : prevText
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
    <div ref={gptOpenCreateImageRef} className="gptOpenCreateImage">
      <div className="gptOpenCreateImageContents">
        {generateTexts().map((data, index) => (
          <span
            className="gptSummarizeText"
            key={`${data}-${index}`}
            onClick={() => handleOpenCreateImageText(data)}
          >
            {data}
          </span>
        ))}
      </div>
    </div>
  )
}
