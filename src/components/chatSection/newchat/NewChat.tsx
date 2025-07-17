import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../../state'
import '../../chatSection/newchat/NewChat.css'

function Cards({
  desc,
  search,
}: {
  desc: string
  search: (file?: File, arg?: string) => Promise<void>
}) {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode)

  return (
    <div
      onClick={() => search(undefined, desc)}
      className={`container cursor-pointer ${isDarkMode && 'dark'}`}
    >
      <p className="text">{desc}</p>
    </div>
  )
}

export default function NewChat({
  search,
}: {
   search: (file?: File, arg?: string) => Promise<void>
}) {
  return (
    <div className="newchat-container">
      <Cards desc="How to make my day awesome 😎🌄" search={search} />
      <Cards desc="How to be a good host 🎙️" search={search} />
      <Cards
        desc="Help create a plan for healthy eating 🍔🍔"
        search={search}
      />
      <Cards desc="Tips on work-life balance ⚖️⚖️" search={search} />
      <Cards desc="Tell me a fun fact of the day 😁🎉" search={search} />
      <Cards desc="Ideas on creating Tik-Tok content 🎛️💃" search={search} />
    </div>
  )
}
