import React from 'react'
import './MenuBar.css'
import { AppDispatch, RootState } from '../../state'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../state/slice/authSlice'
import { setActiveSection } from '../../state/slice/sectionSlice'
import { logoutCleanup } from '../../utils/siderUtility/siderUtility'

interface MenuOptionContentProps {
  imageSrc: string
  text?: string
  style?: {}
}

interface MenuOptionProps {
  onMouseEnter: () => void
  onMouseLeave: () => void
}

const MenuOptionContent: React.FC<MenuOptionContentProps> = ({
  imageSrc,
  text,
  style,
}) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode)
  const dispatch = useDispatch<AppDispatch>()
  return (
    <div
      className={
        isDarkMode ? 'menuOptionContentDetailsDark' : 'menuOptionContentDetails'
      }
      style={style}
      onClick={text === 'Logout' ? async () => {
        dispatch(logout())
        await logoutCleanup()
        dispatch(setActiveSection('homeSection'))} 
        : text === "Profile" ? () => dispatch(setActiveSection('profileSection')) 
        : () => {}}
    >
      <img
        src={imageSrc}
        alt={text ? text : 'menu icon'}
        className="menuOptionContentIcon"
      />
      <span
        className={
          isDarkMode ? 'menuOptionContentTextDark' : 'menuOptionContentText'
        }
      >
        {text}
      </span>
    </div>
  )
}

const MenuOption: React.FC<MenuOptionProps> = ({
  onMouseEnter,
  onMouseLeave,
}) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode)
  return (
    <div
      className={isDarkMode ? 'menuOptionDark' : 'menuOption'}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="menuOptionContentHolder">
        <MenuOptionContent
          imageSrc={
            isDarkMode ? 'images/shareIcon2.svg' : 'images/shareIcon.svg'
          }
          text={'Share'}
        />
        <MenuOptionContent
          imageSrc={
            isDarkMode ? 'images/profileIcon2.svg' : 'images/profileIcon.svg'
          }
          text={'Profile'}
        />
        <MenuOptionContent
          imageSrc={
            isDarkMode ? 'images/loginIcon2.svg' : 'images/loginIcon.svg'
          }
          text={'Logout'}
        />
      </div>
    </div>
  )
}

export default MenuOption
