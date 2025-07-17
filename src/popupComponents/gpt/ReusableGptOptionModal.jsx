import React from 'react'
import '../gpt/GptSection.css'
import { gptModalActions } from '../../utils/gptMockedData'

export default function ReusableGptOptionModal({ query, setGptModal, title }) {
  const handleDelete = async () => {
    setGptModal({ id: query, title: title })
  }
  return (
    <div className="reusableGptOptionModal">
      <div className="reusableGptOptionModalContents">
        {gptModalActions.map((data, index) => (
          <div
            key={`${data.name}-${index}`}
            className="reusableGptOptionModalDetails"
            onClick={data.name === 'Delete' ? handleDelete : () => {}}
          >
            <img
              src={data.icon}
              alt="icon"
              className="reusableGptOptionModalDetailsImg"
            />
            <span
              style={
                data.name === 'Delete'
                  ? {
                      color: 'red',
                      fontSize: '13px',
                    }
                  : {
                      color: 'black',
                      fontSize: '13px',
                    }
              }
            >
              {data.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
