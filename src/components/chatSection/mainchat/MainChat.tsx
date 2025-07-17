import React, { useEffect, useRef, useState } from 'react'
import { UserDetail } from '../type'
import ChatHistory from '../chathistory/ChatHistory';
import ChatHeader from '../chatheader/ChatHeader';
import ChatInput from '../chatinput/ChatInput';
import { GPTResult } from '../../../state/types/gpt';
import { getLatestGptResult, queryDeepSeek, queryGPT, queryPerplexity, storeGptResult } from '../../../state/slice/gpt/gptApi';
import { AppDispatch, RootState } from '../../../state';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveChatState, setLatestFailed, setLatestFulfilled, setLatestPending, setRanQueryState } from '../../../state/slice/gpt/gptSlice';
import NewChat from '../newchat/NewChat';
import ChatInteraction from '../chatinteraction/ChatInteraction';
import { createRoot } from 'react-dom/client'
import { LuCopy } from 'react-icons/lu'
import { toast } from 'react-toastify';
import '../../chatSection/mainchat/mainChat.css'
import { setActivationNeeded, setPaymentModalInfo } from '../../../state/slice/reusableStatesSlice';
import Backdrop from '../../backdrop/Backdrop';
import DeleteChat from '../chatinteraction/DeleteChat';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

export default function MainChat({userDetail}:{
  userDetail:UserDetail;
}) {
  const [isFullSidebar, setIsFullSidebar] = useState<boolean>(false)
  const [mustPair, setMustPair] = useState<boolean>(false)
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [queries, setQueries] = useState<GPTResult[]>([])
  const { activeChat, ranQuery, chatLoading } = useSelector(
    (state: RootState) => state.gpt
  )
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode)
  const {tracking} = useSelector((state:RootState)=>state.tracking)
  const { chatModelDetail } = useSelector((state: RootState) => state.reusable);
  const dispatch = useDispatch<AppDispatch>()
  const [deleteModal, setDeleteModal] = useState<boolean>(false)
  const [deleteData, setDeleteData] = useState<{ id: number; value: string }>({
    id: 0,
    value: '',
  })

  // Functions
  function isUserAllowed(){
    if(
      tracking!.noOfTimesChatGptIsUsed > 500 &&
      !(userDetail?.user as any)?.isSubscribed
    ){
      dispatch(
        setPaymentModalInfo(
          'With your current plan, you cannot use this service. Upgrade your plan to access this service!',
        ),
      );
      dispatch(setActivationNeeded(true));
      return false
    }
    return true
  }

  async function getQuery() {
    dispatch(setLatestPending())
    const res = await getLatestGptResult(activeChat.id)
    if(!res){ 
      setQueries([]); 
      dispatch(setLatestFailed())
    } else {
      setQueries(res.result)
    }
   
    dispatch(setLatestFulfilled())
  }

  function setDelete(data: { id: number; value: string }, off?: boolean) {
    if(off){
      setDeleteModal(false)
      return
    }

    setDeleteData(data)
    setDeleteModal(true)
  }

  const getDateOnly = (date: Date): string => {
    return date.toISOString().split('T')[0] // Format: YYYY-MM-DD
  }

async function sendQuery(file?: File, quickSearch?: string) {
  const newQue = quickSearch ? quickSearch.trim() : textAreaRef.current?.value.trim();
  const isAuth = isUserAllowed();
  const isComplete = mustPair ? !!file && !!newQue : !!newQue;

  if (isAuth && !isComplete && mustPair) toast.info("Please add a file");

  if (isComplete && isAuth) {
    if (textAreaRef.current) textAreaRef.current.value = "";
    setMustPair(false)

    const prepQuery = {
      query: newQue!,
      response: "",
      isNew: true,
    };

    if (file) {
      prepQuery.query += ` ${file.name}`
    }

    queries.push(prepQuery)
    setQueries([...queries]);

    const cleanHtml = (html: string): string => {
      let cleaned = html
        .replace(/<li>\s*<\/li>/g, '')
        .replace(/<strong>\s*<\/strong>/g, '');
      cleaned = cleaned.replace(/<li>\s*<strong>([^<]+)<\/strong>/g, '<li><strong>$1</strong>');
      return cleaned;
    };

    const cb = async (res: string) => {
      const toUpdate = queries[queries.length - 1];
      if (['deepseek-chat', 'deepseek-coder', 'deepseek-auto','gpt-4.0'].includes(chatModelDetail.model)) {
        const markedResult = await marked.parse(res, { gfm: true, breaks: true });
        const sanitizedResult = DOMPurify.sanitize(markedResult, {
        ADD_TAGS: ['h1', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'p', 'strong', 'em', 'pre', 'code', 'table', 'tr', 'td', 'th', 'div'],
        ADD_ATTR: ['class', 'style'],
        });
        toUpdate.response = sanitizedResult;
      } else {
        const markedResult = await marked.parse(res, { gfm: true, breaks: true });
        const cleanedResult = cleanHtml(markedResult);
        const sanitizedResult = DOMPurify.sanitize(cleanedResult, {
          ADD_TAGS: ['h1', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'p', 'strong', 'em', 'pre', 'code', 'table', 'tr', 'td', 'th', 'div'],
          ADD_ATTR: ['class', 'style'],
        });
        toUpdate.response = sanitizedResult;
      }
      setQueries([...queries]);
      containerRef.current?.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    };

    if (chatModelDetail.model === "gpt-4.0") {
      await queryGPT({ query: newQue!, file }, cb);
    } else if(['deepseek-chat', 'deepseek-coder', 'deepseek-auto'].includes(chatModelDetail.model)) {
      await queryDeepSeek({ query: newQue!, model: chatModelDetail.model, file }, cb);
    } else {
      await queryPerplexity({ query: newQue!, model: chatModelDetail.model, file }, cb);
    }
    
    const updatedQueries = [...queries];
    const lastIndex = updatedQueries.length - 1;
    const { isNew, ...cleansedQuery } = updatedQueries[lastIndex];
    updatedQueries[lastIndex] = cleansedQuery;
    setQueries([...updatedQueries]);

    if (activeChat.id !== -1) cleansedQuery.id = activeChat.id;
    const newId = await storeGptResult({ ...cleansedQuery });
    localStorage.setItem("gptActiveChat", JSON.stringify(newId));
    dispatch(setActiveChatState(newId));

    const today = new Date();
    const chatDate = activeChat.updatedAt ? new Date(activeChat.updatedAt) : new Date();
    if (activeChat.id === -1 || getDateOnly(today) > getDateOnly(chatDate)) {
      dispatch(setRanQueryState(ranQuery ? 0 : 1));
    }
  }
}

useEffect(() => {
  const codeBlocks = document.querySelectorAll("pre code");
  setTimeout(() => {
    codeBlocks.forEach((block) => {
      const pre: any = block.parentNode;
      if (!pre.querySelector(".copy-button")) {
        const codeText = (block as any).innerText;

        const container = document.createElement('div')
        container.style.position = 'relative'

        pre.parentNode?.insertBefore(container, pre)
        container.appendChild(pre)

        const buttonContainer = document.createElement("div");
        buttonContainer.style.position = "absolute";
        buttonContainer.style.top = "10px";
        buttonContainer.style.right = "10px";

        container.appendChild(buttonContainer)

        const root = createRoot(buttonContainer);
        root.render(
          <LuCopy
            onClick={() => {
              window.navigator.clipboard.writeText(codeText);
              toast.success("Code copied");
            }}
            color="grey"
            className="cursor-pointer copy-button"
          />
        );

        pre.appendChild(buttonContainer);
      }
    });
  }, 500);
    
  containerRef.current?.scrollTo({
    top: containerRef.current.scrollHeight,
    behavior: "smooth",
  });
}, [activeChat, queries]);


  useEffect(()=>{
    if (activeChat.id == -1) setQueries([]);
    getQuery()
  },[activeChat])

  return (
    <div className='mainChatContainer'>
      {/* History */}
      <div className={`mainChatHistoryContainer ${isDarkMode ? 'darkmode':'lightmode'} ${ isFullSidebar ? 'fullbar': 'collapsed'}`}>
        <ChatHistory 
          isFullSidebar={isFullSidebar} 
          setIsFullSidebar={setIsFullSidebar}
        />
      </div>
      <div className='mainChatBodyContainer remove-scrollbar'>
        {/** Header */}
        <div className='header'>
          <ChatHeader isFullSidebar={isFullSidebar} setIsFullSidebar={setIsFullSidebar}/>
        </div>
        {/** Question and Answer */}
        <div ref={containerRef} className='mainChatQandAContainer remove-scrollbar'>
          {chatLoading && queries.length === 0 ? (
            <div className="loading">
              <span className="loader"></span>
            </div>
            ) : activeChat.id == -1 && queries.length === 0 ? (
              <div className='newchat'>
                <NewChat search={sendQuery} />
              </div>
            ) : (
              queries?.map((query, i) => (
                <ChatInteraction
                  key={i}
                  query={query.query}
                  setDelete={setDelete}
                  id={query.id}
                  response={query.response}
                />
              ))
            )
          }
        </div>
        {/**GPT Input field */}
        <div className='mainChatInput'>
          <ChatInput sendQuery={sendQuery} mustPair={mustPair} setMustPair={setMustPair} textAreaRef={textAreaRef} lastQ={queries[queries.length - 1] || { isNew: false }}/>
        </div>
      </div>
      {deleteModal && (
        <Backdrop>
          <DeleteChat 
            setDelete={setDelete} 
            details={{
              id: deleteData.id,
              value:deleteData.value,
              chatId: activeChat.id
            }}
            refreshQuery={getQuery}
          />
        </Backdrop>
      )}
    </div>
  )
}   