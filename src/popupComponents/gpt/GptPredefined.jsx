import React from 'react'
import '../gpt/GptSection.css'
import { chatGptPredefined } from '../../utils/utility'

export default function GptPredefined({
  hoveredPredefined,
  handlePredefinedText,
  setShowQuestionAndAnswer,
  handleAsk,
  setQuery,
  setImmediateResponse,
  userDetail,
  setActivationNeeded,
  setPaymentModalInfo,
  trackingRecord,
}) {
  const handlePredefinedClick = async (text) => {
    if (
      trackingRecord &&
      trackingRecord.noOfTimesChatGptIsUsed > 4 &&
      !userDetail?.user?.isSubscribed
    ) {
      setActivationNeeded(true)
      setPaymentModalInfo(
        'With your current plan, you cannot use this service. Upgrade your plan to access this service!',
      )
    } else {
      handleAsk(text)
      setShowQuestionAndAnswer(true)
      setQuery(text)
      setImmediateResponse(true)
    }
  }
  return (
    <>
      <div className="chatGptMinContentsPredefined">
        {chatGptPredefined.map((data, index) => (
          <div
            key={`${data.text}-${index}`}
            className={
              hoveredPredefined === data.text
                ? 'chatGptMainContentPredefinedDetailsExtra'
                : 'chatGptMainContentPredefinedDetails'
            }
            onMouseEnter={() => handlePredefinedText(data.text)}
            onMouseLeave={() => handlePredefinedText(null)}
            onClick={() => handlePredefinedClick(data.text)}
          >
            {/* <span
              className={
                hoveredPredefined === data.text
                  ? 'chatGptMainContentPredefinedHeaderExtra'
                  : 'chatGptMainContentPredefinedHeader'
              }
            >
              {data.action}
            </span> */}
            <span
              className={
                hoveredPredefined === data.text
                  ? 'chatGptMainContentPredefinedContentExtra'
                  : 'chatGptMainContentPredefinedContent'
              }
            >
              {data.text}
            </span>
          </div>
        ))}
      </div>
    </>
  )
}
