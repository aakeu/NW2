import React, { useEffect, useRef, useState } from 'react'
import { TbArrowsExchange } from "react-icons/tb";
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { RootState } from '../../state';
import { IoClose, IoCopy } from "react-icons/io5";
import { HiSpeakerWave } from "react-icons/hi2";
import { FaDownload } from "react-icons/fa6";
import { loadAuthData } from '../../state/slice/authSlice';
import { il8n, languages } from '../../utils/translate/languages';
import '../translateSection/TranslateSection.css'

export default function MainTranslate() {
    const [wordLength, setWordLength] = useState<number>(0)
    const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode)
    const {query} = useSelector((state: RootState) => state.translate)
    const [response, setResponse] = useState<string>('')
    const [translating, setTranslating] = useState(false)
    const [isReading, setIsReading] = useState(false)
    const fromRef = useRef<HTMLSelectElement>(null)
    const toRef = useRef<HTMLSelectElement>(null)
    const textAreaRef = useRef<HTMLTextAreaElement>(null)

    const saveResponse = async () => {
        const blob = new Blob([response], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `QS-translated.txt`
        a.click()
        URL.revokeObjectURL(url)
    }

    function readText(){
        const speech = new SpeechSynthesisUtterance(response);
        speech.lang = il8n[toRef.current!.value as keyof typeof il8n] || "en-US";
        speech.onstart = () => setIsReading(true)
        speech.onend = () => setIsReading(false)
        window.speechSynthesis.speak(speech);
        setIsReading(true)
    }

    const stopReading = () => {
        window.speechSynthesis.cancel();
        setIsReading(false)
    }

    function switchLanguage () {
        if(fromRef.current && toRef.current){
            const tmpLang = fromRef.current?.value
            fromRef.current.value = toRef.current.value
            toRef.current.value = tmpLang
        }
    }

    const handleSubmit = async () => {
        const {token} = await loadAuthData()
        setTranslating(true)
        setResponse('')

        if(fromRef.current && toRef.current){
            console.log(fromRef.current?.value, ' ',toRef.current?.value)
            if(fromRef.current?.value === toRef.current?.value){
                toast.error('⚠ Select a different target language for translation.')
                setTranslating(false)
                return;
            }

            try {
                const response = await fetch(
                    `${process.env.REACT_APP_QAPI_URL}/gpts/translate`,
                    {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        text: textAreaRef.current?.value,
                        targetLanguage: toRef.current?.value,
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
                setResponse(responseData)
            } catch (err:any) {
                setTranslating(false)
                toast.error('Something went wrong. Please try again later.')
            }
        } else {
            setTranslating(false)
            toast.error('Something went wrong. Please try again later.')
        }
    }

    useEffect(()=>{
        setWordLength(query.length)
    },[query])

  return (
    <div className='translate-container'>
        <h2>Translate</h2>
        <div className='container-cover'>
            <div className='header'>
                <div className='w-full'>
                    <select 
                        ref={fromRef} 
                        defaultValue={languages[5]}
                        className={`select-area ${isDarkMode && 'dark'}`}
                    >
                        {languages.map((itm, i) => <option key={i} value={itm}>{itm}</option>)}
                    </select>
                </div>
                <div className={`textarea-cover ${isDarkMode && 'dark'}`}>
                    <textarea 
                        ref={textAreaRef} 
                        defaultValue={query}
                        onChange={({target})=>setWordLength(target.value.length)} 
                        className={`textarea remove-scrollbar ${isDarkMode && 'dark'}`}
                    />
                    <div className='actions'>
                        <p>{`${wordLength} / 10000`}</p>
                        <button 
                            disabled={wordLength > 10000 || wordLength === 0 || translating}
                            onClick={handleSubmit}
                        >
                            {wordLength < 10000 && wordLength !== 0 && !translating && (
                                <img src='images/translate-white.svg' alt='Translate Logo' className='img-area'/>
                            )}
                            <p>Translate</p>
                        </button>
                    </div>
                </div>
            </div>

            <div className='swap'>
                <TbArrowsExchange
                    onClick={switchLanguage}
                    className='swap-icon'
                />
            </div>

            <div className='header'>
                <div className='w-full'>
                    <select 
                        ref={toRef} 
                        defaultValue={languages[5]}
                        className={`select-area ${isDarkMode && 'dark'}`}
                    >
                        {languages.map((itm, i) => <option key={i} value={itm}>{itm}</option>)}
                    </select>
                </div>
                <div className={`textarea-cover ${isDarkMode && 'dark'}`}>
                    <textarea 
                        value={response}
                        disabled
                        className={`response remove-scrollbar ${isDarkMode && 'dark'}`}
                    />
                    {response && (
                        <div className='res-actions'>
                            <IoCopy 
                                onClick={()=>{
                                    navigator.clipboard.writeText(response)
                                    toast.success('Text copied')
                                }}
                                color='#38507e'
                                className='res-actions-icon'
                            /> 
                            {isReading ? (
                                  <IoClose
                                    onClick={stopReading}
                                    color='red'
                                    className="res-actions-icon"
                                    />
                            ) : (
                                <HiSpeakerWave 
                                    color='#38507e'
                                    onClick={readText}
                                    className='res-actions-icon'
                                />
                            )}
                            <FaDownload 
                                onClick={saveResponse}
                                color='#38507e'
                                className='res-actions-icon' 
                            />
                        </div>
                    )}
                </div>  
            </div>  
        </div>
    </div>
  )
}
