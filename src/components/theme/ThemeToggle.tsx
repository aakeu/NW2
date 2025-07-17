import React, { useEffect } from 'react'
import './ThemeToggle.css'
import { useSelector, useDispatch } from 'react-redux'
import { AppDispatch, RootState } from '../../state'
import { initializeTheme, toggleTheme } from '../../state/slice/themeSlice'

const ThemeToggle: React.FC = () => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode)
  const dispatch = useDispatch<AppDispatch>()

  const handleToggle = () => {
    dispatch(toggleTheme(!isDarkMode))
  }

  useEffect(() => {
    dispatch(initializeTheme())
  }, [dispatch])

  return (
    <div className="theme-toggle">
      <label className="switch">
        <input type="checkbox" checked={isDarkMode} onChange={handleToggle} />
        <span className="slider"></span>
      </label>
    </div>
  )
}

export default ThemeToggle
