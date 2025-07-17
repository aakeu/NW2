import React, { forwardRef } from 'react'
import '../gpt/GptSection.css'
import {
  backToGptOCRSection,
  backToGptTranslateSection,
  backToMainGptSection,
} from '../../utils/sectionManagement'

const GptMoreFeaturesModal = forwardRef(
  ({ customClass, gptSubSection }, ref) => {
    return (
      <div className={`gptMoreFeaturesModal ${customClass}`} ref={ref}>
        <div className="gptMoreFeaturesContainer">
          {gptSubSection !== 'mainGptSection' && (
            <div
              className="gptTranslateCaptionHolder"
              onClick={() => backToMainGptSection()}
            >
              <img
                src="images/popup/chat.svg"
                alt="translateIcon"
                className="gptTranslateIcon"
              />
              Back To Chat
            </div>
          )}
          {gptSubSection !== 'gptTranslateSection' && (
            <div
              className="gptTranslateCaptionHolder"
              onClick={() => backToGptTranslateSection()}
            >
              <img
                src="images/popup/translate.svg"
                alt="translateIcon"
                className="gptTranslateIcon"
              />
              Translate
            </div>
          )}
          {gptSubSection !== 'gptOCRSection' && (
            <div
              className="gptOCRCaptionHolder"
              onClick={() => backToGptOCRSection()}
            >
              <img src="images/ocr.svg" alt="ocrIcon" className="gptOCRIcon" />
              OCR
            </div>
          )}
        </div>
      </div>
    )
  },
)

export default GptMoreFeaturesModal
