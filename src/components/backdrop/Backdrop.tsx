import React from 'react'
import './backdrop.css'

const Backdrop: React.FC<{children: React.ReactNode}> = ({children}:{children: React.ReactNode}) => {
  return <div className='backdrop'>
    {children}
  </div>
}

export default Backdrop
