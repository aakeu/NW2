import React, { SetStateAction, useRef, useState } from 'react'
import SpecialCommandButton from '../SpecialCommandButton'
import { FaRegImage } from 'react-icons/fa6'
import { TbClipboardText, TbSend2 } from 'react-icons/tb'
import { ImBlocked } from 'react-icons/im'
import { createImageCommands, summarizeTextCommands } from '../../../utils/gpt/command'
import { gptStoreData } from '../../../state/types/gpt'
import { GrAttachment } from "react-icons/gr";
import { IoClose } from "react-icons/io5";
import { useSelector } from 'react-redux'
import { RootState } from '../../../state'
import '../chatinput/chatInput.css'
import ChatModelSelection from '../chatModelSelection/ChatModelSelection'

export default function ChatInput(
  {sendQuery, textAreaRef, lastQ, setMustPair, mustPair}:{
  lastQ: gptStoreData
  mustPair:boolean
  sendQuery: (file?: File, arg?: string, )=>Promise<void>;
  setMustPair: React.Dispatch<SetStateAction<boolean>>
  textAreaRef: React.RefObject<HTMLTextAreaElement|null>
}) {
  const [file, setFile] = useState<File>()
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode)
  const [q, setQ] = useState<string>('')
  const inputFileRef = useRef<HTMLInputElement>(null)

  function sendSummarizeTextQuery(_:any,value:string){
    setMustPair(true)
    if(textAreaRef.current){
      textAreaRef.current.value = value
      setQ(value)
    }
  }

  function refereshFile(){
    if(inputFileRef.current) inputFileRef.current.value = ''
    setFile(undefined)
  }

  function handlePair(){
    setQ(textAreaRef.current?.value||'')

    if(file && !mustPair){
      setMustPair(true)
    } else if(mustPair) setMustPair(false)
  }

  return (
    <div className="mainChatInputContainer">
      <div className='chatInputTextCover'>
        <div className="mainChatModelSelection">
          <ChatModelSelection />
        </div>
        <textarea
          ref={textAreaRef}
          onInput={handlePair}
          placeholder="Ask anything"
          className={`textArea ${isDarkMode ? 'darkmode' : 'lightmode'}`}
        />
      </div>
      <div className="specialButtonCover">
        <div className="btns-align">
          <SpecialCommandButton
            onClick={sendQuery}
            desc="Create Image"
            Icon={FaRegImage}
            options={createImageCommands}
          />
          <SpecialCommandButton
            desc="Summarize Text"
            Icon={TbClipboardText}
            options={summarizeTextCommands}
            onClick={sendSummarizeTextQuery}
          />
        </div>
        <div className="btns-align">
          {/** Show Preview if File is not empty */}
          {
            file && (()=>{
              const isImage =  ['image/png','image/jpeg','image/jpg','image/webp'].includes(file.type)
              return (
                <div className='file-display'>
                  <IoClose
                    onClick={refereshFile}
                    color='red'
                    className="cursor-pointer btn-style"
                  />
                  {
                    isImage ? (
                      <img src={window.URL.createObjectURL(file)} className='img'/>
                    ):(
                      <div className='file-name'>
                        {file.name}
                      </div>
                    )
                  }
                </div>
              )
            })()
          }

          {/** Attach File button */}
          <div className='file-btn'>
            <input 
              ref={inputFileRef}
              type='file' 
              id='file' 
              accept=".pdf, .xlsx, .xls, .doc, .docx, .csv, .png, .jpeg, .jpg, .webp" 
              onChange={(e)=> e.target.files && setFile(e.target.files[0])}
            />
            <div className='label-cover cursor-pointer'>
              <label htmlFor='file' className={`cursor-pointer ${isDarkMode ? 'darkmode' : 'lightmode'}`}>
                <GrAttachment color="#034AA6" className="btn-style" />
                <span>Attach</span>
              </label>
            </div>
          </div>

          {/** Send Button */}
          <button
            onClick={() =>{
              const _file =file;
              refereshFile()
              sendQuery(_file)
            }}
            disabled={lastQ.isNew}
            className={`cursor-pointer send-btn ${q ? "ques" : "no-ques"}`}
          >
            {lastQ.isNew ? (
              <ImBlocked color="white" className="btn-style" />
            ) : (
              <TbSend2 color="white" className="btn-style" />
            )}
            <span>{lastQ.isNew ? 'Sending..' : 'Send'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
