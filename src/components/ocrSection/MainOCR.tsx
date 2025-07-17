import React, { ButtonHTMLAttributes, InputHTMLAttributes, useEffect, useRef, useState } from 'react'
import { RiImageAiFill } from "react-icons/ri";
import { TbCut } from "react-icons/tb";
import { RiDeleteBinLine } from "react-icons/ri";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../state';
import { FaDownload } from 'react-icons/fa6';
import { HiSpeakerWave } from 'react-icons/hi2';
import { IoClose, IoCopy } from 'react-icons/io5';
import { toast } from 'react-toastify';
import { BsTranslate } from "react-icons/bs";
import { setTranslateQuery } from '../../state/slice/translateSlice';
import { setActiveSection } from '../../state/slice/sectionSlice';
import { loadAuthData } from '../../state/slice/authSlice';

export default function MainOCR() {
  const [image, setImage] = useState<File|null>()
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode)
  const [response, setResponse] = useState<string>()
  const [isReading, setIsReading] = useState(false)
  const uploadRef = useRef<HTMLInputElement>(null)
  const dispatch = useDispatch()

  function clearImage(){
    setImage(null)
    if(uploadRef.current) uploadRef.current.value = ''
  }

  function takeToTranslate (){
    dispatch(setTranslateQuery(response!))
    dispatch(setActiveSection('translateSection')) 
  }
  
  const saveResponse = async () => {
      const blob = new Blob([response!], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `QS-OCR.txt`
      a.click()
      URL.revokeObjectURL(url)
  }

  function readText(){
      const speech = new SpeechSynthesisUtterance(response);
      speech.lang = "en-US"; //update later
      speech.onstart = () => setIsReading(true)
      speech.onend = () => setIsReading(false)
      window.speechSynthesis.speak(speech);
      setIsReading(true)
  }

  const stopReading = () => {
      window.speechSynthesis.cancel();
      setIsReading(false)
  }

  function takeScreenShot(){
    chrome.windows.getCurrent((tab) => {
      if(!tab.id) return;
      
      chrome.tabs.captureVisibleTab(tab.id, { format: "png" }, (dataUrl) => {
        if (chrome.runtime.lastError) {
          console.error("Screenshot error:", chrome.runtime.lastError.message);
          toast.error("Couldn't take screenshot please ty again")
          return;
        }

        // Convert Data URL to Blob
        fetch(dataUrl)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], "screenshot.png", { type: "image/png" });

            // Now you have the File object, you can send it to your server
            setImage(file);
          });
      });
    })
  }

  async function performOCR(){
    const {token} = await loadAuthData()
    try {
      setResponse('')

      const formData = new FormData()
      formData.append('file', image!)

      const response = await fetch(
        `${process.env.REACT_APP_QAPI_URL}/gpts/ocr`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        const errorMessage =
          errorData?.message ||
          'Something went wrong. Please try again later.'
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
      let errorMessage = 'Something went wrong. Please try again later.'

      if (
        err.message.includes('Unauthenticated') ||
        err.message.includes('401')
      ) {
        errorMessage = 'Your session has expired. Please log in again.'
      } else if (
        err.message.includes('500') ||
        err.message.includes('Internal Server Error')
      ) {
        errorMessage = 'Something went wrong. Please try again later.'
      }
    }
  }

  function handleOnChange(e:any){
    const value = e.target.files
    if(value && image !== value[0]){
      const maxSizeInMB = 15;
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

      if (!value[0].type.startsWith("image/")) {
        alert("Only image files are allowed.");
        e.value = ''; // reset the input
        return;
      }

      if (value[0].size > maxSizeInBytes) {
        toast.info("Image must be less than 15MB.");
        e.value = ''; // reset the input
        return;
      }

      setImage(value[0])
    }
  }

  useEffect(()=>{
    if(image) performOCR()
  },[image])

  return (
  <div className='ocr-container'>
    <h2>OCR</h2>
    <div className='ocr-interface'>
      <div className={image ? `ocr-res ${isDarkMode && 'ocr-dark'}` : `ocr-req`}>
        {image ? (
          <>
            <img src={URL.createObjectURL(image)}/>
            <div className='ocr-res-action-container'>
              <div className='ocr-phase1'>
                <label htmlFor='ocr-upload' className='ocr-change-img'>
                  <input ref={uploadRef} type='file' id='ocr-upload' accept="image/*" onChange={handleOnChange} />
                  <RiImageAiFill color='white' size={24} />
                </label>
                <button onClick={takeScreenShot} className='ocr-extract-text'>
                  <TbCut color='#034aa6' size={24}/>
                </button>
              </div>
              <button className='ocr-delete' onClick={clearImage}>
                <RiDeleteBinLine color='#D70A0A' size={24} />
              </button>
            </div>
          </>
        ) : (
          <div className='ocr-upload-icon-container'>
            <label htmlFor='ocr-upload'>
              <input type='file' id='ocr-upload' accept="image/*" onChange={handleOnChange} />
              <img
                src="images/cloud-upload.svg"
                alt="upload"
                className="ocr-upload-icon"
              />
            </label>
            <p>Click to Upload Photo</p>
            <p className='ocr-upload-info'>Please only upload files (Max size up to 15 MB)</p>
          </div>
        )}
      </div>
      {image ? (
        <div className='ocr-result-container'>
          <h2 className='ocr-result-header'>Result:</h2>
          <div className={`ocr-response-text ${isDarkMode && 'ocr-dark'} remove-scrollbar`}>
            {!response ? (
              <div className='ocr-response-loader-container'>
                <div className="ocr-response-loader">
                  <span className={`ocr-dot ${isDarkMode && 'ocr-dot-dark'} ocr-animate-wave-1`}></span>
                  <span className={`ocr-dot ${isDarkMode && 'ocr-dot-dark'} ocr-animate-wave-2`}></span>
                  <span className={`ocr-dot ${isDarkMode && 'ocr-dot-dark'} ocr-animate-wave-3`}></span>
                </div>
              </div>
            ) : (
              <textarea
                value={response}
                disabled
                className={`ocr-response remove-scrollbar ${isDarkMode && 'ocr-response-dark'}`}
              />
            )}
          </div>
          {response && (
            <div className='ocr-res-actions'>
              <IoCopy 
                  onClick={()=>{
                      navigator.clipboard.writeText(response)
                      toast.success('Text copied')
                  }}
                  color='#38507e'
                  size={14}
              /> 
              {isReading ? (
                    <IoClose
                      onClick={stopReading}
                      color='red'
                      size={14}
                      />
              ) : (
                  <HiSpeakerWave 
                      color='#38507e'
                      onClick={readText}
                      size={14}
                  />
              )}
              <FaDownload 
                  onClick={saveResponse}
                  color='#38507e'
                  size={14} 
              />
              <BsTranslate 
                  onClick={takeToTranslate}
                  color='#38507e'
                  size={14} 
              />
            </div>
          )}
        </div> 
      ) : (
        <>
        <h2>OR</h2>
        <button onClick={takeScreenShot} className='ocr-take-screenshot-btn'>Take a Screenshot</button>
        </>
      )}
    </div>
  </div>
  )
}
