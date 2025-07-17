import React from 'react'
import './WelcomeScreen.css'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../state'
import { setActiveSection } from '../../state/slice/sectionSlice'

const WelcomeScreen: React.FC = () => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode)
  const dispatch = useDispatch<AppDispatch>()
  return (
    <div className="welcome">
      <img src={isDarkMode ? "images/quick_search.png" : "images/logo.svg"} 
        className={`welcomeLogo ${isDarkMode && "welcomeLogoExtra"}`} alt="logo" />

      <img src="images/rect3.svg" className="welcomeRect3" alt="rect 3" />
      <img src="images/rect2.svg" className="welcomeRect2" alt="rect 2" />
      <img src="images/rect1.svg" className="welcomeRect1" alt="rect 1" />
      <div className="welcomeMessage">
      <h2 className={`welcomeHeading ${isDarkMode && "welcomeHeadingExtra"}`}>Welcome</h2>
        <p className="welcomeInfo">
          Meet your AI-powered productivity assistant – search faster, 
          stay private, and organize smarter. Your clutter-free, secure web experience starts now. Try it free.
        </p>
        <button
          className="welcomeBtn"
          onClick={() => dispatch(setActiveSection('homeSection'))}
        >
          Get Started
        </button>
      </div>
    </div>
  )
}

export default WelcomeScreen
