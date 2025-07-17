import React, { SetStateAction } from 'react'
import { GiHamburgerMenu } from "react-icons/gi";
import { useSelector } from 'react-redux';
import { RootState } from '../../../state';
import { FaUserGroup } from "react-icons/fa6";
import '../chatheader/chatHeader.css'

export default function ChatHeader({
  isFullSidebar, 
  setIsFullSidebar,
}: {
  isFullSidebar: boolean
  setIsFullSidebar: React.Dispatch<SetStateAction<boolean>>
}) {
    const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode)


  return (
    <div className='chatHeaderContainer'>
      <div className="layer1">
          <div className='layer2'>
              <GiHamburgerMenu 
                  onClick={()=>setIsFullSidebar(!isFullSidebar)} 
                  color={isDarkMode?'white':'black'} 
                  className='cursor-pointer btn-1'
              />
              <FaUserGroup 
                  color='#034AA6' 
                  className='btn-1'
              />
              <div className="textContainer">
                  <span className="gpt-text">AI</span>
                  <span className="gpt-text-2">
                      Search with AI and get quick response
                  </span>
              </div>
          </div>
      </div>
    </div>
  )
}
