import React from 'react'
import '../gpt/GptSection.css'

export function ReusableTooltip({ text }) {
  return <div className="gptTooltip">{text}</div>
}

export function AttachFileInfo({ text, style }) {
  return <div style={style} className="attachFileInfo">{text}</div>
}
