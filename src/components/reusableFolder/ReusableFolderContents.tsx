import React, { useEffect, useRef } from 'react'
import '../reusableFolder/ReusableFolderContents.css'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../state'
import {
  setFolderOpen,
  setSelectedFolder,
} from '../../state/slice/reusableStatesSlice'
import {
  fetchAllFolders,
  initializeFolders,
} from '../../state/slice/folderSlice'
import OnboardingModal from '../onboarding/Onboarding'

interface ReusableFolderContentsProps {
  isMarginLeft: boolean
  placedOnTop: boolean
  style?: {}
}

const ReusableFolderContents: React.FC<ReusableFolderContentsProps> = ({
  isMarginLeft,
  placedOnTop,
  style
}) => {
  const { folderOpen, selectedFolder, isOnboardingSelectAFolder, showOnboardingModal } = useSelector(
    (state: RootState) => state.reusable,
  )
  const { token, user } = useSelector((state: RootState) => state.auth);
  const { folders } = useSelector((state: RootState) => state.folders)
  const isDark = useSelector((state: RootState) => state.theme.isDarkMode)
  const dispatch = useDispatch<AppDispatch>()
  const folderRef = useRef<HTMLDivElement>(null)

  const handleFolderOpen = async (event: React.MouseEvent<HTMLDivElement>): Promise<void> => {
    event.stopPropagation()
    await dispatch(fetchAllFolders()).unwrap()
    dispatch(setFolderOpen(!folderOpen))
  }

  const handleSelectFolder = (folder: string | null) => {
    dispatch(setSelectedFolder(folder))
    dispatch(setFolderOpen(false))
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (
      folderRef.current &&
      !folderRef.current.contains(event.target as Node)
    ) {
      dispatch(setFolderOpen(false))
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    dispatch(fetchAllFolders())
  }, [dispatch])

  useEffect(() => {
    dispatch(initializeFolders())
  }, [dispatch])

  return (
    <div
      style={style}
      className={`${isDark ? 'folderSelectHolderDark' : 'folderSelectHolder'} ${
        isMarginLeft ? 'folderSelectHolderMgLeft' : ''
      }`}
      ref={folderRef}
    >
      <div className="folderSelectContentArrow" onClick={handleFolderOpen}>
        <span className={isDark ? 'selectedFolderDark' : 'selectedFolder'}>
          {selectedFolder ? selectedFolder : 'Select a folder'}
        </span>
        <img src="images/arrowUp.svg" alt="arrow" className="arrowUp" />
      </div>
      {folderOpen && (
        <div
          className={
            placedOnTop
              ? isDark
                ? 'folderContentsHolderOnTopDark'
                : 'folderContentsHolderOnTop'
              : isDark
              ? 'folderContentsHolderDark'
              : 'folderContentsHolder'
          }
          id="folderContentsHolder"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="folderContentsContainer">
            <span
              className="folderContentName"
              onClick={() => handleSelectFolder(null)}
            >
              Select a folder
            </span>
            {Array.isArray(folders) &&
              folders.map((folder) => (
                <span
                  className={`folderContentName ${
                    selectedFolder === folder.name
                      ? 'folderContentNameExtra'
                      : ''
                  }`}
                  key={folder.id}
                  onClick={() => handleSelectFolder(folder.name)}
                  style={
                    folder.name === selectedFolder
                      ? {
                          backgroundColor: '#F0F7FB',
                        }
                      : {}
                  }
                >
                  {folder.name}
                </span>
              ))}
          </div>
        </div>
      )}
      {token && showOnboardingModal && isOnboardingSelectAFolder && (
        <OnboardingModal 
          style={{ 
            display: "block", 
            position: "absolute", 
            top: "130px", 
            marginLeft: "50px"
          }}
          tipPosition="topCenter"
        />
      )}
    </div>
  )
}

export default ReusableFolderContents
