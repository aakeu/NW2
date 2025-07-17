import React, { useEffect, useRef, useState } from 'react'
import '../gpt/GptSection.css'
import ReusableGptOptionModal from './ReusableGptOptionModal'
import { ReusableTooltip } from './ReusableTooltip'
import { getLatestGptResult } from '../../api/store_gpt_result'
import { getChromeStorage, setChromeStorage } from '../../utils/utility'

export default function GptSidebar({
  isFullSidebar,
  setShowQuestionAndAnswer,
  gptHistory,
  setSelectedGptHistory,
  setGptModal,
  allGptStoredResults,
  setActiveChatId,
  currentChatDetails,
  setImmediateResponse,
  activeChatId,
}) {
  const [hoveredSidebarData, setHoveredSidebarData] = useState(null)
  const [clickedSidebarData, setClickedSidebarData] = useState(null)
  const modalRef = useRef(null)

  const getAllGptWithSameSession = async (id) => {
    const gptDataWithSameSession = await getLatestGptResult(id)

    const existingGptResults = (await getChromeStorage('gptStoredResult')) || {
      allGptHistory: { today: [], p7days: [], pmonth: [], old: [] },
      allGptResults: [],
      activeChatId: null,
    }
    setActiveChatId(id)

    let allGptResults = [...(existingGptResults.allGptResults || [])]
    if (gptDataWithSameSession && gptDataWithSameSession.id) {
      const index = allGptResults.findIndex(
        (data) => data.id === gptDataWithSameSession.id,
      )
      if (index !== -1) {
        allGptResults[index] = gptDataWithSameSession
      }
    }

    const updatedResults = {
      ...existingGptResults,
      allGptResults: allGptResults,
      activeChatId: id,
    }

    await setChromeStorage({ gptStoredResult: updatedResults })
    if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({
        type: 'GPT_STORED',
      })
    }

    setShowQuestionAndAnswer(true)
    setSelectedGptHistory(gptDataWithSameSession)
    setImmediateResponse(false)
  }

  useEffect(() => {
    async function displayCurrentChatDetails() {
      const existingGptResults = (await getChromeStorage(
        'gptStoredResult',
      )) || {
        allGptHistory: { today: [], p7days: [], pmonth: [], old: [] },
        allGptResults: [],
        activeChatId: null,
      }
      await getAllGptWithSameSession(existingGptResults.activeChatId)
    }
    if (currentChatDetails) {
      displayCurrentChatDetails()
    }
  }, [currentChatDetails])

  const handleNewPage = () => {
    setShowQuestionAndAnswer(false)
    setActiveChatId(null)
  }

  const handleHoveredSidebarData = (text) => {
    setTimeout(() => {
      setHoveredSidebarData(text)
    }, 1000)
  }
  const handleHoveredSidebarDataClick = (text) => {
    setClickedSidebarData(text)
    setHoveredSidebarData(null)
  }

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      setClickedSidebarData(null)
    }
  }

  useEffect(() => {
    if (clickedSidebarData) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [clickedSidebarData])

  return (
    <>
      <div className={'chatGptSidebar'}>
        <button className="chatGptSidebarNewChatBtn" onClick={handleNewPage}>
          <img
            src={'images/popup/gptNewChat.svg'}
            alt="new chat icon"
            className="chatGptSidebarNewChatIcon"
          />
          {isFullSidebar ? (
            ''
          ) : (
            <span className="chatGptSidebarNewChatText">New Chat</span>
          )}
        </button>
        <div className="chatGptSidebarHistoryCaption">
          <img
            src={'images/popup/clock.svg'}
            alt="clock"
            className={
              isFullSidebar
                ? 'chatGptSidebarHistoryCaptionImg'
                : 'chatGptSidebarHistoryCaptionImgExtra'
            }
          />
          <span className="chatGptSidebarHistoryText">
            {isFullSidebar ? '' : 'Search History'}
          </span>
        </div>
        {allGptStoredResults &&
          allGptStoredResults.allGptHistory &&
          ['today', 'p7days', 'pmonth', 'old'].map((dt, index) => {
            const title =
              dt === 'today'
                ? 'Today'
                : dt === 'p7days'
                ? 'Past 7 Days'
                : dt === 'pmonth'
                ? 'Past Month'
                : dt === 'old'
                ? 'Earlier Months'
                : ''
            return (
              allGptStoredResults.allGptHistory[dt]?.length > 0 && (
                <div
                  key={`${dt}-${index}`}
                  className="chatGptSidebarHistoryContentDetails"
                >
                  <span className="chatGptSidebarHistoryContentDate">
                    {isFullSidebar ? title.slice(0, 3) + '..' : title}
                  </span>
                  {allGptStoredResults.allGptHistory[dt]
                    .sort(
                      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
                    )
                    .map((data) => (
                      <div
                        key={data.id}
                        className={
                          hoveredSidebarData
                            ? 'chatGptSidebarHistoryContentHolderExtra'
                            : data.id === activeChatId
                            ? 'chatGptSidebarHistoryContentHolderExtra'
                            : 'chatGptSidebarHistoryContentHolder'
                        }
                        onMouseEnter={(e) => {
                          if (
                            e.target.closest('.chatGptSidebarHistoryDetailImg')
                          )
                            return
                          handleHoveredSidebarData(data.id)
                        }}
                        onMouseLeave={(e) => {
                          if (
                            e.target.closest('.chatGptSidebarHistoryDetailImg')
                          )
                            return
                          handleHoveredSidebarData(null)
                        }}
                        onClick={() => getAllGptWithSameSession(data.id)}
                      >
                        <span className="chatGptSidebarHistoryDetail">
                          {isFullSidebar
                            ? data.title.slice(0, 3) + '..'
                            : data.title.slice(0, 13) + '...'}
                        </span>
                        {!isFullSidebar && (
                          <>
                            <img
                              src={'images/popup/ellipses.svg'}
                              alt="Ellipses"
                              className="chatGptSidebarHistoryDetailImg"
                              onMouseEnter={(e) => {
                                e.stopPropagation()
                                handleHoveredSidebarData(data.id)
                              }}
                              onMouseLeave={(e) => {
                                e.stopPropagation()
                                handleHoveredSidebarData(null)
                              }}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleHoveredSidebarDataClick(data.id)
                              }}
                            />
                            {hoveredSidebarData === data.id && (
                              <ReusableTooltip text={'Options'} />
                            )}
                            {clickedSidebarData === data.id && (
                              <div ref={modalRef}>
                                <ReusableGptOptionModal
                                  query={data.id}
                                  setGptModal={setGptModal}
                                  title={data.title}
                                />
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                </div>
              )
            )
          })}
      </div>
    </>
  )
}
