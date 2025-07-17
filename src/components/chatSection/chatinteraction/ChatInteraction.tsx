import React, { useEffect, useRef } from 'react'
import { FaRegSave } from 'react-icons/fa'
import { FaRegCopy } from 'react-icons/fa6'
import { RiDeleteBinLine } from "react-icons/ri";
import { toast } from 'react-toastify'
import TurndownService from 'turndown'
import DOMPurify from 'dompurify'
import { gptStoreData } from '../../../state/types/gpt'
import { useSelector } from 'react-redux'
import { RootState } from '../../../state'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'
import '../../chatSection/chatinteraction/chatInteraction.css'

export default function ChatInteraction({
  response,
  id,
  query,
  setDelete,
}: gptStoreData & { setDelete: (arg: { id: number; value: string }, off?: boolean) => void}) {
  const toMarkDown = new TurndownService()
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode)
  const resRef = useRef<HTMLDivElement>(null)

  const saveSelectedResponse = async (query: string, text: string) => {
    const streamlinedName = query.split(' ').join('').slice(0, 27) + '...'
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${streamlinedName}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

 useEffect(() => {
    if (resRef.current) {
      const purifyRes = DOMPurify.sanitize(response, {
        ADD_TAGS: ['h1', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'p', 'strong', 'em', 'blockquote', 'pre', 'code', 'table', 'tr', 'td', 'th', 'div'],
        ADD_ATTR: ['class', 'style'],
      });
      if (purifyRes.includes('<li></li>') || purifyRes.includes('<strong></strong>')) {
        console.warn('Malformed HTML detected:', purifyRes);
      }
      resRef.current.innerHTML = purifyRes;

      const links = resRef.current.querySelectorAll('a.citation-link');
      links.forEach((link) => {
        (link as HTMLAnchorElement).setAttribute('target', '_blank');
        (link as HTMLAnchorElement).setAttribute('rel', 'noopener noreferrer');
      });

      const codeBlocks = resRef.current.querySelectorAll('pre code');
      codeBlocks.forEach((block) => {
        hljs.highlightElement(block as HTMLElement);
      });
    }
  }, [response]);
  
  // useEffect(()=>{
  //   const purifyRes = DOMPurify.sanitize(response)
  //   const tempDiv = document.createElement('div');
  //   tempDiv.innerHTML = purifyRes;

  //   const codeBlocks = tempDiv.querySelectorAll('pre code');
  //     codeBlocks.forEach((block) => {
  //     hljs.highlightElement(block as HTMLElement);
  //   });

  //   if(resRef.current){
  //     resRef.current.innerHTML = ''
  //     Array.from(tempDiv.childNodes).forEach((node) => {
  //       resRef.current?.appendChild(node);
  //     });
  //   }
  // },[response])

  return (
    <>
      <div className="interaction-sender">
        <div className={`sender ${isDarkMode ? 'dark' : ''}`} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(query) }} />
      </div>
      <div className="interaction-response-container">
        {!response ? (
          <div className="response-loader">
            <span className={`dot ${isDarkMode && 'dark'} animate-wave-1`}></span>
            <span className={`dot ${isDarkMode && 'dark'} animate-wave-2`}></span>
            <span className={`dot ${isDarkMode && 'dark'} animate-wave-3`}></span>
          </div>
        ) : (
          <div ref={resRef} className="response" />
        )}
        {response && (
          <div className="res-icons-container">
            <FaRegCopy
              color="#034AA6"
              onClick={() => {
                const md = toMarkDown.turndown(response)
                window.navigator.clipboard.writeText(md)
                toast.success('Text copied')
              }}
              className="cursor-pointer response-ri"
            />
            <FaRegSave
              onClick={() => {
                saveSelectedResponse(query, response)
              }}
              color="#034AA6"
              className="cursor-pointer response-ri"
            />
            <RiDeleteBinLine
              onClick={() => setDelete({ id: id!, value: query })}
              color="red"
              className="cursor-pointer response-ri"
            />
          </div>
        )}
      </div>
    </>
  )
}
