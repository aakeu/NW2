import React from 'react'
import { PiInfinity } from "react-icons/pi";

export default function ActivityContainer({name, current, total}: {name: string; current: number; total:number}) {
  const percentage = total === 0 ? current > 25 ? 30 : 0 : (current / total) * 100

  return (
    <div className='activity-container'>
      <h2 className='activity-header'>{name}</h2>
      <div>
        <div className='activity-progress-bar-container'>
          <div className='activity-progress-bar' style={{width: `${percentage}%`}}></div>
        </div>
        <div style={{ color: '#0A58D0' }}>
          {total === 0 ? (
            <div className='activity-counter'>
              {current} / <PiInfinity />
            </div>
          ) : (
            `${current} / ${total}`
          )}
        </div>
      </div>
    </div>
  )
}
