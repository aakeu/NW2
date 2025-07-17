import React from 'react'
import { IconType } from 'react-icons';
import { IoClose } from 'react-icons/io5';
import { FaCheck } from "react-icons/fa6";

export default function FeatureContainer({Icon, name, featureState}: {Icon: IconType|string; name: string, featureState: string|boolean}) {
  return (
    <div className='profile-feature-container'>
      {typeof Icon === 'string' ? (
        <img src={Icon} />
      ) : (
        <Icon size={24} color='#034AA6'/>
      )}
      <p className='profile-feat-text'>{`${name} ${featureState === 'limited' ? '(Limited)' : ''}`}</p>
      <div>
        {featureState ? (
            <FaCheck size={16} color='#22CD3E'/>
          ) : (
           <IoClose size={16} color='#ED5050' />
          )
        }
      </div>
    </div>
  )
}
