import React, { useState } from 'react'
import { IconType } from 'react-icons/lib'
import { useSelector } from 'react-redux'
import { RootState } from '../../state'

export default function SpecialCommandButton({
  desc,
  Icon,
  options,
  onClick,
}: {
  desc: string
  Icon: IconType
  options: string[]
  onClick: (...arg: any[]) => any
}) {
  const [showOptions, setShowOptions] = useState<boolean>(false)
  const {isDarkMode} = useSelector((state:RootState)=> state.theme)

  return (
    <div className='specialCmdBtnContainer'>
      <button
        onBlur={() => setTimeout(() => setShowOptions(false), 300)}
        onClick={() => setShowOptions(!showOptions)}
        className={`cursor-pointer ${isDarkMode ? 'darkmode' : 'lightmode'}`}
      >
        <Icon
          color="#034AA6"
          className="btn-style"
        />  
        <span>{desc}</span>
      </button>
      <div className={`options ${!showOptions && 'hide'}`}>
        {
          options.map((itm, i)=>(
              <div key={i} onClick={(e) => onClick(null,itm)} className='cursor-pointer'>{itm}</div>
          ))
        }
      </div>
    </div>
  )
}
