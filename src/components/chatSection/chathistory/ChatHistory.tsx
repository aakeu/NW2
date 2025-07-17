'use client'
import { setActiveChatState } from '../../../state/slice/gpt/gptSlice'
import { AppDispatch, RootState } from '../../../state/index'
import React, { SetStateAction, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { RiChatHistoryLine, RiShareBoxFill } from 'react-icons/ri'
import { StoredGpt } from '../../../state/types/gpt'
import { fetchHistory } from '../../../state/slice/gpt/gptApi'
import '../../chatSection/chathistory/chatHistory.css'

export default function ChatHistory({
  isFullSidebar, 
  setIsFullSidebar
}: {
  isFullSidebar: boolean
  setIsFullSidebar: React.Dispatch<SetStateAction<boolean>>
}) {
  const dispatch = useDispatch<AppDispatch>()
  const { history, activeChat, ranQuery, loading, error } = useSelector(
    (state: RootState) => state.gpt
  )
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode)

  async function getHistory() {
    try {
      const getActiveChat = JSON.parse(
        localStorage.getItem('gptActiveChat') || '{"id":-1,"title":""}'
      )
      if (loading) dispatch(setActiveChatState(getActiveChat))
      dispatch(fetchHistory())
    } catch {
      toast.error('Failed to fetch history')
    }
  }

  function openNewChat() {
    const data = { id: -1, title: '' }
    setIsFullSidebar(false)
    localStorage.setItem('gptActiveChat', JSON.stringify(data))
    dispatch(setActiveChatState(data))
  }

  function openChat(itm: StoredGpt) {
    setIsFullSidebar(false)
    localStorage.setItem('gptActiveChat', JSON.stringify(itm))
    dispatch(setActiveChatState(itm))
  }

  function getStyle(id:number):string{
    if(activeChat.id === id){
      if(isDarkMode) return 'active-dark'
      return 'active'
    }

    if(isDarkMode) return 'dark inactive-dark'
    return 'light inactive'
  }

  useEffect(() => {
    getHistory()
  }, [ranQuery])

  useEffect(() => {
    getHistory()
  }, [])

  return (
    <div
      className='mainchat-container remove-scrollbar'
    >
      <div
        onClick={openNewChat}
        className='newchat'
      >
        <RiShareBoxFill
          color="white"
          className={`ri ${isFullSidebar && 'ri-fb'}`}
        />
        <p
          className={`newchat-text ${isFullSidebar && 'block'}`}
        >
          New Chat
        </p>
      </div>

      <div className='search'>
        <RiChatHistoryLine
          color="#034AA6"
          className={`ri ${isFullSidebar && 'ri-fb'}`}
        />
        <p
          className={`search-text ${isFullSidebar && 'block'}`}
        >
          Search History
        </p>
      </div>
      {!loading ? (
        <div className='histories'>
          {history.today.length > 0 && (
            <div className="w-full">
              <h2 className="histories-headers">
                Today
              </h2>
              {history.today.map((itm, i) => (
                <p
                  key={i}
                  onClick={() => openChat(itm)}
                  className={`histories-child cursor-pointer ${getStyle(itm.id)}`}
                >
                  {itm.title}
                </p>
              ))}
            </div>
          )}
          {history.p7days.length > 0 && (
            <div className="w-full">
              <h2 className="histories-headers">
                Previous 7 Days
              </h2>
              {history.p7days.map((itm, i) => (
                <p
                  key={i}
                  onClick={() => openChat(itm)}
                  className={`histories-child cursor-pointer ${getStyle(itm.id)}`}
                >
                  {itm.title}
                </p>
              ))}
            </div>
          )}
          {history.pmonth.length > 0 && (
            <div className="w-full">
              <h2 className="histories-headers">
                Previous Month
              </h2>
              {history.pmonth.map((itm, i) => (
                <p
                  key={i}
                  onClick={() => openChat(itm)}
                  className={`histories-child cursor-pointer ${getStyle(itm.id)}`}
                >
                  {itm.title}
                </p>
              ))}
            </div>
          )}
          {history.old.length > 0 && (
            <div className="w-full">
              <h2 className="histories-headers">
                Others
              </h2>
              {history.old.map((itm, i) => (
                <p
                  key={i}
                  onClick={() => openChat(itm)}
                  className={`histories-child cursor-pointer ${getStyle(itm.id)}`}
                >
                  {itm.title}
                </p>
              ))}
            </div>
          )}
        </div>
      ) : error ? (
        <div className="error">
          <p className="error-text">
            Error loading histories
          </p>
          <button
            onClick={() => getHistory()}
            className="btn-retry"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className='loader-container'>
          <span className="loader"></span>
        </div>
      )}
    </div>
  )
}
